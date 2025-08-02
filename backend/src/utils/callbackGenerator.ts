import type { Memory, GameContext } from '../models/memory.js';
import type { GameState, LifeEvent } from '../models/types.js';

export interface MemoryCallback {
  type: 'anniversary' | 'parallel' | 'emotional' | 'thematic';
  memory: Memory;
  text: string;
}

export class CallbackGenerator {
  generateCallbacks(
    memories: Memory[], 
    context: GameContext,
    gameState: GameState
  ): MemoryCallback[] {
    const callbacks: MemoryCallback[] = [];
    
    for (const memory of memories) {
      const event = gameState.events.find(e => e.id === memory.eventId);
      if (!event) continue;
      
      // Anniversary callbacks
      const anniversary = this.checkAnniversary(memory, event, context);
      if (anniversary) {
        callbacks.push({
          type: 'anniversary',
          memory,
          text: anniversary
        });
      }
      
      // Parallel situation callbacks
      const parallel = this.checkParallelSituation(memory, event, context);
      if (parallel) {
        callbacks.push({
          type: 'parallel',
          memory,
          text: parallel
        });
      }
      
      // Emotional echo callbacks
      const emotional = this.checkEmotionalEcho(memory, event, context);
      if (emotional) {
        callbacks.push({
          type: 'emotional',
          memory,
          text: emotional
        });
      }
    }
    
    // Limit callbacks to avoid overwhelming the narrative
    return callbacks.slice(0, 2);
  }
  
  private checkAnniversary(
    memory: Memory, 
    event: LifeEvent,
    context: GameContext
  ): string | null {
    const yearsSince = context.currentYear - event.year;
    const significantAnniversaries = [5, 10, 20, 25, 50];
    
    if (significantAnniversaries.includes(yearsSince)) {
      const templates = [
        `It's been ${yearsSince} years since ${event.title.toLowerCase()}.`,
        `${yearsSince} years have passed since ${event.title.toLowerCase()}.`,
        `Today marks ${yearsSince} years since ${event.title.toLowerCase()}.`,
        `A ${yearsSince}-year anniversary: ${event.title.toLowerCase()}.`
      ];
      
      return this.selectTemplate(templates);
    }
    
    // Exact age match anniversaries
    if (memory.age === context.currentAge && yearsSince > 0) {
      return `At this same age ${yearsSince} years ago, ${event.title.toLowerCase()}.`;
    }
    
    return null;
  }
  
  private checkParallelSituation(
    memory: Memory,
    event: LifeEvent,
    context: GameContext
  ): string | null {
    // Check if current events share tags with the memory
    const memoryTags = new Set(event.tags);
    const currentTags = new Set(
      context.recentEvents.flatMap(e => e.tags)
    );
    
    const sharedTags = Array.from(memoryTags).filter(tag => 
      currentTags.has(tag)
    );
    
    if (sharedTags.length >= 2) {
      const agePhrase = memory.age < 10 
        ? `when you were ${memory.age}`
        : `at age ${memory.age}`;
      
      const templates = [
        `This reminds you of ${agePhrase}, when ${event.title.toLowerCase()}.`,
        `Just like ${agePhrase}, when ${event.title.toLowerCase()}.`,
        `You recall a similar moment ${agePhrase}: ${event.title.toLowerCase()}.`,
        `The echoes of the past resurface from ${agePhrase}, when ${event.title.toLowerCase()}.`
      ];
      
      return this.selectTemplate(templates);
    }
    
    return null;
  }
  
  private checkEmotionalEcho(
    memory: Memory,
    event: LifeEvent,
    context: GameContext
  ): string | null {
    if (context.currentEmotionalState === undefined) return null;
    
    const emotionalDistance = Math.abs(
      memory.emotionalValence - context.currentEmotionalState
    );
    
    // Very similar emotional state
    if (emotionalDistance < 0.2 && memory.intensity > 0.7) {
      const emotionWord = this.getEmotionWord(memory.emotionalValence);
      
      const templates = [
        `You haven't felt this ${emotionWord} since ${event.title.toLowerCase()}.`,
        `This ${emotionWord} feeling takes you back to when ${event.title.toLowerCase()}.`,
        `The last time you felt this ${emotionWord} was when ${event.title.toLowerCase()}.`
      ];
      
      return this.selectTemplate(templates);
    }
    
    // Opposite emotional state (contrast)
    if (emotionalDistance > 1.5 && memory.intensity > 0.7) {
      const pastEmotion = this.getEmotionWord(memory.emotionalValence);
      const currentEmotion = this.getEmotionWord(context.currentEmotionalState);
      
      return `How different from the ${pastEmotion} days when ${event.title.toLowerCase()}. Now you feel ${currentEmotion}.`;
    }
    
    return null;
  }
  
  generateThematicCallback(
    theme: string,
    memories: Memory[],
    gameState: GameState
  ): string | null {
    if (memories.length < 2) return null;
    
    const events = memories
      .map(m => gameState.events.find(e => e.id === m.eventId))
      .filter(Boolean) as LifeEvent[];
    
    if (events.length < 2) return null;
    
    const themeDescriptions: Record<string, string> = {
      academic_excellence: 'pursuit of knowledge',
      rebellious_spirit: 'defiance of authority',
      family_loyalty: 'dedication to family',
      romantic_journey: 'search for love',
      creative_expression: 'artistic endeavors',
      athletic_prowess: 'physical achievements',
      social_butterfly: 'social connections',
      intellectual_curiosity: 'quest for understanding',
      career_ambition: 'professional growth',
      adventurous_spirit: 'thirst for adventure'
    };
    
    const themeDesc = themeDescriptions[theme] || theme.replace('_', ' ');
    
    return `Your ${themeDesc} has been a constant thread, from ${events[0].title.toLowerCase()} to ${events[events.length - 1].title.toLowerCase()}.`;
  }
  
  private getEmotionWord(valence: number): string {
    if (valence > 0.7) return 'joyful';
    if (valence > 0.3) return 'content';
    if (valence > -0.3) return 'uncertain';
    if (valence > -0.7) return 'troubled';
    return 'devastated';
  }
  
  private selectTemplate(templates: string[]): string {
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  formatCallbackForNarrative(callback: MemoryCallback): string {
    // Add formatting markers for the LLM to recognize as memory references
    return `[MEMORY_CALLBACK] ${callback.text}`;
  }
}