import type { GameState, PlayerChoice, TurnResponse, LifeEvent, Choice, DynamicTurnContext, TimeBlockAllocation } from '../models/types.js';
import type { GameContext } from '../models/memory.js';
import type { TurnResult } from '../models/gamePhases.js';
import { GamePhase, getPhaseForAge, checkPhaseTransition } from '../models/gamePhases.js';
import { PhaseHandlerRegistry } from '../phases/PhaseHandlerRegistry.js';
import { callOpenAI } from '../utils/llm.js';
import { getStageConfig, advanceTime, getDynamicTurnContext } from '../utils/stageUtils.js';
import { applyStatChanges, applyRelationshipChanges } from '../utils/gameStateUtils.js';
import { DynamicTurnCalculator } from '../utils/dynamicTurns.js';
import { MemoryProcessor } from '../utils/memoryProcessor.js';
import { ThemeDetector } from '../utils/themeDetector.js';
import { MemoryRetriever } from '../utils/memoryRetriever.js';
import { CallbackGenerator } from '../utils/callbackGenerator.js';
import { applyTimeBlockEffects } from '../utils/timeBlocks.js';
import { decodeEarlyLifeChoice } from '../utils/earlyLifeChoices.js';

export async function handleTurn(
  gameState: GameState,
  playerChoice: PlayerChoice,
  gameId?: string,
  userId?: string
): Promise<TurnResponse> {
  // Determine current phase
  const currentPhase = gameState.currentPhase || getPhaseForAge(
    gameState.currentYear - parseInt(gameState.character.dob.split('-')[0])
  );
  
  // Check if we have a phase handler
  const phaseHandler = PhaseHandlerRegistry.getHandler(currentPhase);
  if (phaseHandler) {
    // Use phase handler for turn processing
    const result = await phaseHandler.processTurn(gameState, playerChoice);
    
    // Check for phase transitions
    const newPhase = checkPhaseTransition(result.newGameState);
    if (newPhase && newPhase !== currentPhase) {
      result.newGameState.currentPhase = newPhase;
      if (!result.transitionInfo) {
        result.transitionInfo = {};
      }
      result.transitionInfo.phaseTransition = {
        from: currentPhase,
        to: newPhase
      };
    }
    
    // Convert TurnResult to TurnResponse (they're compatible)
    return result as TurnResponse;
  }
  
  // Fall back to legacy turn handling for phases without handlers
  return handleLegacyTurn(gameState, playerChoice, gameId, userId);
}

// Legacy turn handling (existing code)
async function handleLegacyTurn(
  gameState: GameState,
  playerChoice: PlayerChoice,
  gameId?: string,
  userId?: string
): Promise<TurnResponse> {
  // Calculate current age before turn
  const previousAge = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  const stageConfig = getStageConfig(gameState);
  const turnContext = getDynamicTurnContext(gameState);
  
  // Handle time block allocation turn  
  if (turnContext.triggeredBy === 'time_block_allocation') {
    return handleTimeBlockAllocation(gameState, playerChoice);
  }
  
  // Check if this is the initial early life trigger
  if (playerChoice.id === 'early_life_start' && turnContext.triggeredBy === 'early_life_start') {
    // Let the LLM generate the early life choices
    // Continue to normal LLM processing
  } else {
    // Handle early life choices that encode time block allocations
    const { isEarlyLife, allocation } = decodeEarlyLifeChoice(playerChoice.id);
    if (isEarlyLife && allocation && !gameState.timeBlockAllocations) {
      return handleEarlyLifeChoice(gameState, playerChoice, allocation);
    }
  }
  
  let llmResponse;
  try {
    llmResponse = await callOpenAI({
      gameState,
      playerChoice,
      stageConfig,
      turnContext
    });
  } catch (error) {
    console.error('[handleTurn] Failed to get LLM response:', error);
    // Return a fallback response that keeps the game going
    return {
      narrativeLines: [
        "[A Quiet Moment]",
        "Your choice leads to a moment of quiet reflection. Life continues with its gentle rhythm."
      ],
      transitionInfo: {},
      newGameState: {
        ...gameState,
        pendingChoices: [
          { id: "continue", label: "Continue your journey", tags: ["default"] },
          { id: "reflect", label: "Take time to reflect", tags: ["introspective"] },
          { id: "connect", label: "Reach out to someone", tags: ["social"] }
        ]
      }
    };
  }

  const newEvent: LifeEvent = {
    id: `event_${Date.now()}`,
    year: gameState.currentYear,
    title: llmResponse.appliedEvent.title,
    description: llmResponse.appliedEvent.description,
    statChanges: turnContext.triggeredBy === 'early_life_start' ? {} : llmResponse.appliedEvent.statChanges,
    tags: llmResponse.appliedEvent.tags,
    affectedRelationships: llmResponse.appliedEvent.affectedRelationships
  };

  let updatedGameState = { ...gameState };
  
  updatedGameState = applyStatChanges(updatedGameState, newEvent.statChanges);
  
  if (newEvent.affectedRelationships) {
    updatedGameState = applyRelationshipChanges(
      updatedGameState,
      newEvent.affectedRelationships
    );
  }
  
  updatedGameState.events.push(newEvent);
  
  // Process memory system
  updatedGameState = processMemory(updatedGameState, newEvent);
  
  // Only advance time if we're not in the early life start phase
  if (turnContext.triggeredBy !== 'early_life_start') {
    updatedGameState = advanceTime(updatedGameState);
  }
  
  updatedGameState.pendingChoices = llmResponse.nextChoices;

  // Calculate new age after time advance
  const newAge = updatedGameState.currentYear - parseInt(updatedGameState.character.dob.split('-')[0]);
  
  // Handle perspective switch at age 8
  if (newAge >= 8 && updatedGameState.parentPerspective) {
    updatedGameState.parentPerspective = false;
  }
  
  // Generate age change narrative if age changed (but not for early life start)
  let ageChange = undefined;
  if (newAge !== previousAge && turnContext.triggeredBy !== 'early_life_start') {
    ageChange = {
      previousAge,
      newAge,
      narrative: generateAgeNarrative(newAge, turnContext)
    };
  }
  
  // Determine turn type
  let turnType: 'normal' | 'milestone' | 'sub-turn' | 'time-skip' = 'normal';
  if (turnContext.isMilestone) {
    turnType = 'milestone';
  } else if (turnContext.isSubTurn) {
    turnType = 'sub-turn';
  } else if (turnContext.yearsProgressed > 1) {
    turnType = 'time-skip';
  }
  
  // Generate time span description
  let timeSpan: string | undefined;
  if (turnContext.isSubTurn) {
    timeSpan = turnContext.subTurnName;
  } else if (turnContext.yearsProgressed > 1) {
    timeSpan = `${turnContext.yearsProgressed} years`;
  }
  
  // Format event with stat changes for terminal display
  const statChangeStrings = Object.entries(newEvent.statChanges)
    .map(([stat, change]) => {
      const sign = change > 0 ? '+' : '';
      return `${stat.toUpperCase()} ${sign}${change}`;
    });
  
  const eventLine = statChangeStrings.length > 0 
    ? `[${newEvent.title}: ${statChangeStrings.join(', ')}]`
    : `[${newEvent.title}]`;

  // Format relationship changes for terminal display
  const relationshipLines: string[] = [];
  if (newEvent.affectedRelationships && newEvent.affectedRelationships.length > 0) {
    relationshipLines.push('[Relationships]');
    newEvent.affectedRelationships.forEach(rel => {
      const npc = updatedGameState.relationships.find(r => r.npc.id === rel.npcId);
      if (npc) {
        const statChanges = Object.entries(rel.relStatDeltas)
          .map(([stat, change]) => `${stat} ${change > 0 ? '+' : ''}${change}`)
          .join(', ');
        relationshipLines.push(`- ${npc.npc.name}: ${rel.narrativeImpact} (${statChanges})`);
      }
    });
  }

  // Build complete narrative lines
  const narrativeLines: string[] = [];
  
  // Add event line
  narrativeLines.push(eventLine);
  
  // Generate memory callbacks
  const currentAge = updatedGameState.currentYear - parseInt(updatedGameState.character.dob.split('-')[0]);
  const context: GameContext = {
    currentYear: updatedGameState.currentYear,
    currentAge,
    currentStage: stageConfig.name,
    recentEvents: updatedGameState.events.slice(-5).map(e => ({
      title: e.title,
      tags: e.tags
    })),
    activeRelationships: updatedGameState.relationships
      .filter(r => r.status === 'active')
      .map(r => r.npc.id)
  };
  
  const memoryCallbacks = generateMemoryCallbacks(updatedGameState, context);
  
  // Add memory callbacks if any
  if (memoryCallbacks.length > 0) {
    narrativeLines.push(...memoryCallbacks);
  }
  
  // Add LLM narrative
  const llmLines = llmResponse.narrative
    .split('\n')
    .filter(line => line && line.trim())
    .map(line => line.trim());
  narrativeLines.push(...llmLines);
  
  // Add relationship changes if any
  if (relationshipLines.length > 0) {
    narrativeLines.push(''); // Empty line before relationships
    narrativeLines.push(...relationshipLines);
  }

  return {
    narrativeLines,
    transitionInfo: {
      ageChange,
      turnType,
      timeSpan
    },
    newGameState: updatedGameState
  };
}

function generateAgeNarrative(age: number, turnContext: DynamicTurnContext): string {
  // Special handling for early life time blocks
  if (age === 8 && turnContext.yearsProgressed === 8) {
    return "Eight years of childhood have shaped who you are. Your early interests and hobbies have laid the foundation for the person you're becoming.";
  } else if (age === 12 && turnContext.yearsProgressed === 4) {
    return "The bridge between childhood and adolescence crosses beneath you. Four formative years of growing independence, deepening friendships, and discovering your own interests have prepared you for the teenage years ahead.";
  }
  
  // Special narratives for milestones
  if (turnContext.isMilestone) {
    const milestones: Record<number, string> = {
      8: "Eight years old - the golden age of childhood, where imagination still reigns but understanding deepens.",
      12: "Twelve years old - standing at the threshold between childhood and the teenage years.",
      13: "The transformation begins - adolescence arrives with all its complexities and promise.",
      16: "Sweet sixteen brings new freedoms, new responsibilities, and a taste of independence.",
      18: "The legal threshold of adulthood - society now sees you differently.",
      21: "Full legal adulthood arrives in all jurisdictions - the training wheels are officially off.",
      25: "A quarter-century of life - young enough for adventures, old enough for wisdom.",
      30: "A new decade dawns - time to reflect on youth while embracing maturity.",
      40: "The milestone of middle age - life's experiences have shaped who you've become.",
      50: "Half a century of memories, relationships, and accumulated wisdom.",
      65: "The traditional retirement age - a time for new chapters and reflection.",
      70: "Seven decades of life - each year now a precious gift to be savored.",
      80: "An octogenarian milestone - few reach this summit of human experience."
    };
    
    if (milestones[age]) {
      return milestones[age];
    }
  }
  
  // Time skip narratives
  if (turnContext.yearsProgressed > 1) {
    return generateTimeSkipNarrative(turnContext.yearsProgressed);
  }
  
  // Sub-turn narratives
  if (turnContext.isSubTurn) {
    return `[${turnContext.subTurnName}]`;
  }
  
  // Generic age progression messages
  if (age < 10) return `You turn ${age}, each day bringing new growth and discovery.`;
  if (age < 20) return `Age ${age} arrives, another step in your journey through youth.`;
  if (age < 40) return `You reach ${age}, steadily building the foundation of your adult life.`;
  if (age < 65) return `At ${age}, you navigate life with accumulated experience and wisdom.`;
  return `You mark ${age} years of life, each one a chapter in your unique story.`;
}

function generateTimeSkipNarrative(yearsProgressed: number): string {
  if (yearsProgressed === 1) return '';
  
  // Special handling for early life time spans
  if (yearsProgressed === 8) {
    return 'Eight formative years of childhood pass by...';
  } else if (yearsProgressed === 4) {
    return 'Four transformative years shape your journey from child to young teenager...';
  }
  
  const templates = [
    `${yearsProgressed} years pass in a blur of ordinary moments...`,
    `Time flows steadily forward, carrying you through ${yearsProgressed} years...`,
    `The next ${yearsProgressed} years unfold with quiet consistency...`,
    `Life settles into familiar rhythms for ${yearsProgressed} years...`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function processMemory(gameState: GameState, newEvent: LifeEvent): GameState {
  // Initialize memory system if it doesn't exist
  if (!gameState.memorySystem) {
    gameState.memorySystem = {
      memories: {},
      themes: {},
      coreMemoryIds: []
    };
  }
  
  // Process the new event into a memory
  const memoryProcessor = new MemoryProcessor();
  const themeDetector = new ThemeDetector();
  
  const memory = memoryProcessor.evaluateEvent(newEvent, gameState);
  
  // Add memory to system
  gameState.memorySystem.memories[memory.id] = memory;
  
  // Update core memories if needed
  memoryProcessor.updateCoreMemories(memory, gameState.memorySystem);
  
  // Detect and update themes
  const detectedThemes = themeDetector.detectThemes(memory, newEvent, gameState);
  themeDetector.updateThemes(memory, detectedThemes, gameState.memorySystem, gameState.currentYear);
  
  // Apply memory decay to manage memory limit
  memoryProcessor.processMemoryDecay(gameState.memorySystem, gameState.currentYear);
  
  return gameState;
}

function generateMemoryCallbacks(
  gameState: GameState,
  context: GameContext
): string[] {
  if (!gameState.memorySystem) return [];
  
  const memoryRetriever = new MemoryRetriever();
  const callbackGenerator = new CallbackGenerator();
  
  // Get relevant memories
  const relevantMemories = memoryRetriever.getRelevantMemories(
    context,
    gameState.memorySystem,
    5
  );
  
  // Generate callbacks
  const callbacks = callbackGenerator.generateCallbacks(
    relevantMemories,
    context,
    gameState
  );
  
  // Update memory access times
  for (const callback of callbacks) {
    memoryRetriever.updateMemoryAccess(callback.memory, gameState.currentYear);
  }
  
  return callbacks.map(cb => callbackGenerator.formatCallbackForNarrative(cb));
}

function handleTimeBlockAllocation(
  gameState: GameState,
  playerChoice: PlayerChoice
): TurnResponse {
  // Parse the time block allocation from the player choice
  let allocation: TimeBlockAllocation;
  
  try {
    // Expected format: "timeblock_physical:2_cognitive:2_social:2_creative:2_emotional:2"
    const parts = playerChoice.id.split('_');
    allocation = {
      physical: 2,
      cognitive: 2,
      social: 2,
      creative: 2,
      emotional: 2
    };
    
    // Parse allocation values
    for (let i = 1; i < parts.length; i++) {
      const [category, value] = parts[i].split(':');
      if (category && value) {
        (allocation as any)[category] = parseInt(value);
      }
    }
  } catch (error) {
    console.error('Failed to parse time block allocation:', error);
    // Default to balanced allocation
    allocation = {
      physical: 2,
      cognitive: 2,
      social: 2,
      creative: 2,
      emotional: 2
    };
  }
  
  // Apply time block effects to character stats
  const { stats, traits } = applyTimeBlockEffects(gameState.character.stats, allocation);
  
  // Update game state with allocation and modified stats
  const updatedGameState: GameState = {
    ...gameState,
    timeBlockAllocations: allocation,
    parentPerspective: false, // Use child perspective
    character: {
      ...gameState.character,
      stats,
      traits: [...gameState.character.traits, ...traits]
    }
  };
  
  // Generate narrative for the allocation
  const narrativeLines = [
    "[Early Childhood Development Plan]",
    "",
    "As new parents, you carefully consider how to nurture your child's development over these crucial early years.",
    "",
    generateAllocationNarrative(allocation),
    "",
    "With these priorities in mind, you embark on the journey of raising your child..."
  ];
  
  // Set up choices for the next turn (age 0-3 progression)
  const nextChoices: Choice[] = [
    {
      id: "begin_journey",
      label: "Begin your child's journey",
      tags: ["start", "parent_perspective"]
    }
  ];
  
  return {
    narrativeLines,
    transitionInfo: {
      turnType: 'normal'
    },
    newGameState: {
      ...updatedGameState,
      pendingChoices: nextChoices
    }
  };
}

function generateAllocationNarrative(allocation: TimeBlockAllocation): string {
  const priorities: string[] = [];
  
  // Sort categories by allocation value
  const sorted = Object.entries(allocation)
    .sort(([, a], [, b]) => b - a);
  
  for (const [category, value] of sorted) {
    if (value >= 4) {
      priorities.push(`You'll focus heavily on ${category} development, making it a cornerstone of your parenting approach.`);
    } else if (value >= 3) {
      priorities.push(`${category.charAt(0).toUpperCase() + category.slice(1)} growth will be a significant priority in your household.`);
    } else if (value >= 2) {
      priorities.push(`You'll ensure adequate attention to ${category} development.`);
    } else {
      priorities.push(`While not neglected, ${category} development will receive less emphasis.`);
    }
  }
  
  return priorities.join('\n');
}

function handleEarlyLifeChoice(
  gameState: GameState,
  playerChoice: PlayerChoice,
  allocation: TimeBlockAllocation
): TurnResponse {
  // Apply time block effects to character stats
  const { stats, traits } = applyTimeBlockEffects(gameState.character.stats, allocation);
  
  // Update game state with allocation and modified stats
  const updatedGameState: GameState = {
    ...gameState,
    timeBlockAllocations: allocation,
    parentPerspective: false, // Use child perspective
    character: {
      ...gameState.character,
      stats,
      traits: [...gameState.character.traits, ...traits]
    }
  };
  
  // Generate narrative for the choice
  const narrativeLines = [
    "[Early Childhood Years]",
    "",
    playerChoice.label || "You've chosen a path for your child's early development.",
    "",
    "The years ahead will be shaped by this focus, laying the foundation for the person they will become."
  ];
  
  // Advance time to age 8 (full childhood period)
  let finalGameState = updatedGameState;
  // Need to call advanceTime with the proper context to progress 8 years
  const dynamicCalculator = new DynamicTurnCalculator(updatedGameState);
  const turnContext = dynamicCalculator.calculateNextTurn();
  finalGameState = advanceTime(updatedGameState);
  
  return {
    narrativeLines,
    transitionInfo: {
      turnType: 'normal' as const,
      // yearsProgressed: 8, // This field doesn't exist in TurnResponse
      ageChange: {
        previousAge: 0,
        newAge: 8,
        narrative: "Eight formative years of childhood pass by..."
      }
    },
    newGameState: finalGameState
  };
}
