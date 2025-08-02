import OpenAI from 'openai';
import { z } from 'zod';
import type { GameState, PlayerChoice, StageConfig, LifeEvent, Choice, DynamicTurnContext } from '../models/types.js';
import type { GameContext } from '../models/memory.js';
import { MemoryRetriever } from './memoryRetriever.js';
import { ThemeDetector } from './themeDetector.js';

let openai: OpenAI;

const LLMResponseSchema = z.object({
  narrative: z.string().max(500),
  appliedEvent: z.object({
    title: z.string(),
    description: z.string(),
    statChanges: z.record(z.number()).default({}).transform(changes => {
      // Ensure all values are numbers and within range
      const cleaned: Record<string, number> = {};
      for (const [key, value] of Object.entries(changes)) {
        if (typeof value === 'number') {
          cleaned[key] = Math.max(-20, Math.min(20, value));
        }
      }
      return cleaned;
    }),
    tags: z.array(z.string()).default([]),
    affectedRelationships: z.array(z.object({
      npcId: z.string(),
      relStatDeltas: z.record(z.number()),
      narrativeImpact: z.string()
    })).default([])
  }),
  nextChoices: z.array(z.object({
    id: z.string(),
    label: z.string(),
    tags: z.array(z.string()).default([])
  })).min(1).max(5)
});

type LLMResponse = z.infer<typeof LLMResponseSchema>;

export async function callOpenAI({
  gameState,
  playerChoice,
  stageConfig,
  turnContext
}: {
  gameState: GameState;
  playerChoice: PlayerChoice;
  stageConfig: StageConfig;
  turnContext?: DynamicTurnContext;
}): Promise<LLMResponse> {
  // Lazy initialize OpenAI client
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  const recentEvents = gameState.events.slice(-5).map(e => ({
    year: e.year,
    title: e.title,
    tags: e.tags
  }));
  
  const activeRelationships = gameState.relationships
    .filter(r => r.status === 'active')
    .map(r => ({
      id: r.npc.id,
      name: r.npc.name,
      type: r.relType,
      stats: r.relStats
    }));

  // Always use child perspective now
  const isParentPerspective = false;
  const perspectiveNote = '';

  const systemPrompt = `You are FateEngine v1.1 — narrator & referee for a life simulation game.
${perspectiveNote}
Return ONLY valid JSON with these THREE top-level fields:

{
  "narrative": "story text here",
  "appliedEvent": {
    "title": "event title",
    "description": "event description",
    "statChanges": {"intelligence": 2, "health": 5},
    "tags": ["tag1", "tag2"],
    "affectedRelationships": [
      {
        "npcId": "parent_jessica",
        "relStatDeltas": {"intimacy": 5, "trust": 3},
        "narrativeImpact": "Your bond with Jessica grows stronger."
      }
    ]
  },
  "nextChoices": [
    {"id": "choice1", "label": "Choice text", "tags": ["tag1"]},
    {"id": "choice2", "label": "Choice text", "tags": []},
    {"id": "choice3", "label": "Choice text", "tags": []}
  ]
}

IMPORTANT: nextChoices must be at the ROOT level, NOT inside appliedEvent!

Full schema details:
- narrative: string (max 120 words)
- appliedEvent.statChanges: object with numeric values (DO NOT use + prefix, just numbers like 2 not +2)
- appliedEvent.tags: array of strings
- appliedEvent.affectedRelationships: array where each object MUST have:
  * npcId: string (use format like "parent_jessica", "friend_alex", etc.)
  * relStatDeltas: object with numeric values for intimacy, trust, attraction, conflict
  * narrativeImpact: string describing the relationship change
- nextChoices: array of choice objects (3-5 choices)

CRITICAL: 
- In statChanges, use plain numbers like {"health": 5} NOT {"health": +5}
- For affectedRelationships, use npcId NOT name, and relStatDeltas NOT statChanges

Rules:
• Character is ${age} years old, in ${stageConfig.name} life stage
• Stage tags: ${stageConfig.promptTags.join(', ')}
• Total stat changes must sum to -20 to +20
• Each relationship stat delta must be -20 to +20
• Romantic/sexual content only if all involved are 18+
• No hate speech, no sexual violence, no incest
• Provide 3-5 meaningful, age-appropriate choices
• Reference core memories and themes when relevant to create narrative continuity
• Let past experiences subtly influence current choices and reactions
• CRITICAL: Keep narrative under 120 words (500 characters max)
${turnContext?.triggeredBy === 'early_life_start' ? `
SPECIAL EARLY LIFE CHOICES:
Generate 4 choices for what will be the child's main hobby/interest during ages 0-8. Each choice should:
- Be phrased from the child's perspective as their primary interest or hobby
- Represent different types of childhood activities that shape development
- Use natural, age-appropriate language that a child might gravitate toward
- Include specific activities that fit the family's background and era
- Encode the allocation in the choice ID using format: early_[descriptor]_p[#]c[#]s[#]r[#]e[#]
  where p=physical, c=cognitive, s=social, r=creative, e=emotional (total must equal 10)

Examples:
- ID: "early_sports_p4c1s2r1e2" Label: "Playing sports and running around outside"
- ID: "early_books_p1c4s2r1e2" Label: "Reading books and solving puzzles"  
- ID: "early_friends_p1c1s4r2e2" Label: "Playing with friends and making up games"
- ID: "early_arts_p1c1s2r4e2" Label: "Drawing, painting, and building with blocks"
` : ''}

${turnContext ? `Turn Context:
• Turn Type: ${turnContext.isMilestone ? 'MILESTONE AGE' : turnContext.isSubTurn ? 'SUB-TURN' : 'NORMAL'}
• Years Progressing: ${turnContext.yearsProgressed}
• Narrative Pressure: ${turnContext.narrativePressure > 0.7 ? 'HIGH - make something significant happen!' : turnContext.narrativePressure > 0.4 ? 'MEDIUM - include meaningful developments' : 'LOW - ordinary life moments are fine'}
${turnContext.isSubTurn ? `• Sub-turn: "${turnContext.subTurnName}" triggered by "${turnContext.triggeredBy}"` : ''}
${turnContext.isMilestone ? '• This is a MAJOR LIFE MILESTONE - make it memorable and significant!' : ''}
${turnContext.yearsProgressed > 1 ? `• Multiple years passing - summarize the time span appropriately` : ''}` : ''}`;

  // Create a mapping of NPC names to IDs for the prompt
  const npcMapping = gameState.relationships
    .filter(r => r.status === 'active')
    .map(r => ({
      name: r.npc.name,
      npcId: r.npc.id,
      type: r.relType
    }));

  // Build contextual prompt based on procedural background
  let contextualInfo = '';
  if (gameState.proceduralBackground) {
    const { birthplace, familyBackground, era, narrativeContext } = gameState.proceduralBackground;
    contextualInfo = `
Background Context:
- Birthplace: ${birthplace.name} (${birthplace.type}) - ${birthplace.description}
- Family: ${narrativeContext.familyStory}
- Era: ${era.name} - ${narrativeContext.culturalContext}
- Environment: ${narrativeContext.environmentDescription}
- Family Status: ${familyBackground.socioeconomicStatus.replace('_', ' ')}
- Special Circumstances: ${familyBackground.specialCircumstances?.join(', ') || 'None'}

Character Traits (use these to shape narrative and choices):
${gameState.character.traits.map(traitId => {
  const trait = gameState.proceduralBackground?.traits.includes(traitId) ? traitId : traitId;
  return `- ${trait}`;
}).join('\n')}
`;
  }

  // Build memory context if available
  let memoryContext = '';
  if (gameState.memorySystem) {
    const memoryRetriever = new MemoryRetriever();
    const themeDetector = new ThemeDetector();
    
    const context: GameContext = {
      currentYear: gameState.currentYear,
      currentAge: age,
      currentStage: stageConfig.name,
      recentEvents: recentEvents,
      activeRelationships: activeRelationships.map(r => r.id)
    };
    
    const { coreMemories, relevantMemories, activeThemes } = 
      memoryRetriever.getMemoriesForNarrative(gameState, context, 5);
    
    if (coreMemories.length > 0) {
      memoryContext += `\nCore Memories (formative experiences):
${coreMemories.map(m => {
  const event = gameState.events.find(e => e.id === m.eventId);
  return `- Age ${m.age}: ${event?.title || 'Unknown'} (${m.emotionalValence > 0 ? 'positive' : 'negative'})`;
}).join('\n')}`;
    }
    
    if (relevantMemories.length > 0) {
      memoryContext += `\n\nRelevant Past Experiences:
${relevantMemories.map(m => {
  const event = gameState.events.find(e => e.id === m.eventId);
  const yearsSince = gameState.currentYear - (event?.year || gameState.currentYear);
  return `- ${event?.title || 'Unknown'} (${yearsSince} years ago, ${m.emotionalValence > 0 ? 'positive' : 'negative'} memory)`;
}).join('\n')}`;
    }
    
    if (activeThemes.length > 0) {
      memoryContext += `\n\nRecurring Life Themes:
${activeThemes.map(theme => {
  const narrative = themeDetector.getThemeNarrative(theme);
  return `- ${narrative} (strength: ${Math.round(theme.strength * 100)}%)`;
}).join('\n')}`;
    }
  }

  // Build time block context if available
  let timeBlockContext = '';
  if (gameState.timeBlockAllocations) {
    const allocations = gameState.timeBlockAllocations;
    const focuses: string[] = [];
    
    if (allocations.physical >= 3) focuses.push('physical development and active play');
    if (allocations.cognitive >= 3) focuses.push('learning and cognitive stimulation');
    if (allocations.social >= 3) focuses.push('social interaction and relationships');
    if (allocations.creative >= 3) focuses.push('creative expression and imagination');
    if (allocations.emotional >= 3) focuses.push('emotional security and attachment');
    
    timeBlockContext = `
Early Childhood Focus Areas:
- Physical: ${allocations.physical}/4 blocks
- Cognitive: ${allocations.cognitive}/4 blocks  
- Social: ${allocations.social}/4 blocks
- Creative: ${allocations.creative}/4 blocks
- Emotional: ${allocations.emotional}/4 blocks

Primary focuses: ${focuses.length > 0 ? focuses.join(', ') : 'balanced development'}
`;
  }

  const userPrompt = `Current game state:
Character: ${gameState.character.name}, ${gameState.character.gender}, ${age} years old
Stats: ${JSON.stringify(gameState.character.stats)}
Traits: ${gameState.character.traits.join(', ')}
Recent events: ${JSON.stringify(recentEvents)}
Active relationships: ${JSON.stringify(activeRelationships)}
${contextualInfo}
${memoryContext}
${timeBlockContext}

IMPORTANT NPC IDs for relationships:
${npcMapping.map(npc => `- ${npc.name}: use npcId "${npc.npcId}" (${npc.type})`).join('\n')}

Player chose: "${playerChoice.label || playerChoice.id}"${playerChoice.isCustom ? ' (CUSTOM ACTION)' : ''}

${playerChoice.isCustom ? `
IMPORTANT: This is a custom action typed by the player. 
- Interpret their intent generously but age-appropriately
- Generate a plausible narrative outcome that honors their creativity
- If the action is impossible or inappropriate, narrate a failed attempt or redirect
` : ''}

${turnContext?.triggeredBy === 'early_life_start' ? `
IMPORTANT: This is the FIRST TURN of the game. The player just created their character who is currently age 0.
- Generate a VERY brief introduction (1-2 sentences max) about being born
- Then present 4 choices asking "What will your main hobby as a child be?"
- Frame choices as activities the child will gravitate toward during ages 0-8
- Make choices reflect the family's socioeconomic status, location, and era
- Do NOT use parent perspective - write from child's future perspective
- Keep the narrative VERY short - focus on generating the hobby choices
` : ''}

Generate the narrative consequence, stat changes, and next choices. 
- Make the narrative reflect the character's traits, background, and era
- Choices should align with trait tendencies and family circumstances
- Reference specific details from their birthplace and family when relevant
- Remember to use the exact npcId values listed above for any affectedRelationships
${isParentPerspective ? `
- Frame all choices as parental decisions (e.g., "Enroll in music classes", "Focus on outdoor play", "Read together every night")
- Narrative should describe observing the child's development and reactions
- Stat changes reflect the child's development based on parental choices and time block allocations
- Consider the early childhood focus areas when generating events and choices` : ''}`;

  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Calling OpenAI API for age ${age} in stage ${stageConfig.name}`);
    console.log(`[${timestamp}] Using model: gpt-4.1`);
    console.log(`[${timestamp}] System prompt length: ${systemPrompt.length}, User prompt length: ${userPrompt.length}`);
    
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',  // Using GPT-4.1 for better narratives
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      // Temporarily removing JSON mode to see raw responses
      // response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1000
    });

    const responseTime = Date.now() - startTime;
    console.log(`[${timestamp}] OpenAI response received in ${responseTime}ms`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error(`[${timestamp}] No content in OpenAI response:`, completion);
      throw new Error('No response from OpenAI');
    }

    console.log(`[${timestamp}] Raw OpenAI response:`, content);
    
    // Try to parse the JSON
    let parsedResponse;
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();
    
    // Fix common JSON syntax issues
    // Replace +number with just number in JSON values
    cleanedContent = cleanedContent.replace(/:\s*\+(\d+)/g, ': $1');
    // Ensure numbers don't have leading zeros (except decimals)
    cleanedContent = cleanedContent.replace(/:\s*0+(\d+)/g, ': $1');
    
    try {
      if (cleanedContent !== content.trim()) {
        console.log(`[${timestamp}] Cleaned content:`, cleanedContent);
      }
      parsedResponse = JSON.parse(cleanedContent);
      console.log(`[${timestamp}] Successfully parsed JSON`);
    } catch (e) {
      console.error(`[${timestamp}] Failed to parse JSON:`, e);
      console.error(`[${timestamp}] Original content:`, content);
      console.error(`[${timestamp}] Cleaned content:`, cleanedContent);
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log(`[${timestamp}] Successfully extracted and parsed JSON from response`);
        } catch (e2) {
          console.error(`[${timestamp}] Failed to parse extracted JSON:`, e2);
          throw new Error('Invalid JSON from OpenAI');
        }
      } else {
        throw new Error('No valid JSON found in OpenAI response');
      }
    }
    
    // Fix common structural issues
    if (parsedResponse.appliedEvent && parsedResponse.appliedEvent.nextChoices && !parsedResponse.nextChoices) {
      console.log('Fixing misplaced nextChoices');
      parsedResponse.nextChoices = parsedResponse.appliedEvent.nextChoices;
      delete parsedResponse.appliedEvent.nextChoices;
    }
    
    // Transform affectedRelationships if they're in the wrong format
    if (parsedResponse.appliedEvent && parsedResponse.appliedEvent.affectedRelationships) {
      parsedResponse.appliedEvent.affectedRelationships = parsedResponse.appliedEvent.affectedRelationships.map((rel: any) => {
        // If the relationship has 'name' instead of 'npcId', transform it
        if (rel.name && !rel.npcId) {
          console.log(`[${timestamp}] Transforming relationship format for ${rel.name}`);
          return {
            npcId: `${rel.type || 'npc'}_${rel.name.toLowerCase().replace(/\s+/g, '_')}`,
            relStatDeltas: rel.statChanges || rel.relStatDeltas || {},
            narrativeImpact: rel.narrativeImpact || `Your relationship with ${rel.name} changes.`
          };
        }
        // Ensure all required fields exist
        return {
          npcId: rel.npcId || 'unknown_npc',
          relStatDeltas: rel.relStatDeltas || {},
          narrativeImpact: rel.narrativeImpact || 'Your relationship changes.'
        };
      });
    }
    
    console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
    const validatedResponse = LLMResponseSchema.parse(parsedResponse);
    
    const moderationResponse = await openai.moderations.create({
      input: validatedResponse.narrative
    });
    
    if (moderationResponse.results[0]?.flagged) {
      throw new Error('Content flagged by moderation');
    }
    
    return validatedResponse;
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] OpenAI call failed:`, error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`[${timestamp}] Error type: ${error.constructor.name}`);
      console.error(`[${timestamp}] Error message: ${error.message}`);
      
      // Check for specific OpenAI error types
      if (error.message.includes('401')) {
        console.error(`[${timestamp}] Authentication error - check API key`);
      } else if (error.message.includes('429')) {
        console.error(`[${timestamp}] Rate limit error - too many requests`);
      } else if (error.message.includes('timeout')) {
        console.error(`[${timestamp}] Timeout error - request took too long`);
      }
    }
    
    console.error(`[${timestamp}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'not set'
    });
    
    // More varied fallback responses based on age and stage
    const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
    let narrative = "Time passes quietly.";
    let title = "A Peaceful Moment";
    let choices = [];
    
    if (age < 3) {
      narrative = "You explore your surroundings with innocent curiosity. Your parents watch over you with loving care.";
      title = "Early Discovery";
      choices = [
        { id: "play", label: "Play with your toys", tags: ["play", "development"] },
        { id: "explore", label: "Crawl around and explore", tags: ["exploration"] },
        { id: "cry", label: "Cry for attention", tags: ["social", "needs"] },
        { id: "sleep", label: "Take a nap", tags: ["rest"] }
      ];
    } else if (age < 6) {
      narrative = "Your world is full of wonder and imagination. Every day brings new adventures.";
      title = "Childhood Wonder";
      choices = [
        { id: "play", label: "Play make-believe games", tags: ["imagination"] },
        { id: "learn", label: "Ask your parents questions", tags: ["learning"] },
        { id: "friends", label: "Play with neighborhood kids", tags: ["social"] },
        { id: "adventure", label: "Explore the backyard", tags: ["exploration"] }
      ];
    } else if (age < 12) {
      narrative = "School days blend together as you grow and learn. Friendships form and change.";
      title = "Growing Up";
      choices = [
        { id: "study", label: "Focus on schoolwork", tags: ["academic"] },
        { id: "friends", label: "Hang out with friends", tags: ["social"] },
        { id: "hobby", label: "Pursue a hobby", tags: ["interests"] },
        { id: "family", label: "Spend time with family", tags: ["family"] }
      ];
    } else {
      choices = [
        { id: "continue", label: "Continue with daily life", tags: ["default"] },
        { id: "reflect", label: "Take time to reflect", tags: ["introspective"] },
        { id: "social", label: "Reach out to someone", tags: ["social"] },
        { id: "change", label: "Try something new", tags: ["adventure"] }
      ];
    }
    
    return {
      narrative,
      appliedEvent: {
        title,
        description: narrative,
        statChanges: {},
        tags: ["fallback"],
        affectedRelationships: []
      },
      nextChoices: choices
    };
  }
}