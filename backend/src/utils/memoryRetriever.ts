import type { Memory, MemorySystem, GameContext, Theme } from '../models/memory.js';
import type { GameState } from '../models/types.js';
import { ThemeDetector } from './themeDetector.js';

export class MemoryRetriever {
  private themeDetector: ThemeDetector;
  
  constructor() {
    this.themeDetector = new ThemeDetector();
  }
  
  getRelevantMemories(
    context: GameContext, 
    memorySystem: MemorySystem, 
    maxMemories: number = 10
  ): Memory[] {
    const memories = Object.values(memorySystem.memories);
    
    // Score each memory for relevance
    const scoredMemories = memories.map(memory => ({
      memory,
      score: this.calculateRelevance(memory, context, memorySystem)
    }));
    
    // Sort by score and take top N
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, maxMemories)
      .map(item => item.memory);
  }
  
  private calculateRelevance(
    memory: Memory, 
    context: GameContext,
    memorySystem: MemorySystem
  ): number {
    let score = 0;
    
    // 1. Core memories always have base relevance
    if (memory.type === 'core') {
      score += 0.5;
    } else if (memory.type === 'significant') {
      score += 0.3;
    }
    
    // 2. Recency factor (memories fade over time)
    const yearsSince = context.currentYear - memory.lastAccessed;
    const recencyScore = Math.max(0, 1 - yearsSince / 20);
    score += recencyScore * 0.3;
    
    // 3. Age similarity (memories from similar life stages)
    const ageDiff = Math.abs(memory.age - context.currentAge);
    if (ageDiff <= 2) {
      score += 0.2; // Very similar age
    } else if (ageDiff <= 5) {
      score += 0.1; // Somewhat similar age
    }
    
    // 4. Theme relevance
    const activeThemes = this.themeDetector.getActiveThemes(memorySystem);
    const memoryThemes = Object.values(memorySystem.themes)
      .filter(theme => theme.relatedMemories.includes(memory.id));
    
    for (const memoryTheme of memoryThemes) {
      if (activeThemes.some(active => active.id === memoryTheme.id)) {
        score += 0.3 * memoryTheme.strength;
      }
    }
    
    // 5. Emotional resonance
    if (context.currentEmotionalState !== undefined) {
      const emotionalMatch = 1 - Math.abs(
        memory.emotionalValence - context.currentEmotionalState
      );
      score += emotionalMatch * 0.2;
    }
    
    // 6. Anniversary bonus (exact year matches)
    const memorableAnniversaries = [1, 5, 10, 20, 25, 50];
    const yearsSinceMemory = context.currentYear - (memory.lastAccessed - (context.currentAge - memory.age));
    if (memorableAnniversaries.includes(yearsSinceMemory)) {
      score += 0.4;
    }
    
    // 7. Life stage transitions
    const transitionAges = [5, 13, 18, 21, 30, 40, 50, 65];
    if (transitionAges.includes(context.currentAge) && 
        transitionAges.includes(memory.age)) {
      score += 0.3; // Both at transition points
    }
    
    // 8. Intensity factor
    score += memory.intensity * 0.2;
    
    return score;
  }
  
  getCoreMemories(memorySystem: MemorySystem): Memory[] {
    return memorySystem.coreMemoryIds
      .map(id => memorySystem.memories[id])
      .filter(Boolean)
      .sort((a, b) => a.age - b.age); // Chronological order
  }
  
  getThematicMemories(
    theme: Theme | string, 
    memorySystem: MemorySystem,
    limit?: number
  ): Memory[] {
    const themeId = typeof theme === 'string' ? theme : theme.id;
    const themeObj = memorySystem.themes[themeId];
    
    if (!themeObj) return [];
    
    const memories = themeObj.relatedMemories
      .map(id => memorySystem.memories[id])
      .filter(Boolean)
      .sort((a, b) => b.intensity - a.intensity); // Most intense first
    
    return limit ? memories.slice(0, limit) : memories;
  }
  
  getMemoriesByEmotion(
    targetValence: number,
    memorySystem: MemorySystem,
    tolerance: number = 0.3
  ): Memory[] {
    return Object.values(memorySystem.memories)
      .filter(memory => 
        Math.abs(memory.emotionalValence - targetValence) <= tolerance
      )
      .sort((a, b) => b.intensity - a.intensity);
  }
  
  getAssociatedMemories(
    memory: Memory,
    memorySystem: MemorySystem,
    depth: number = 1
  ): Memory[] {
    const associated = new Set<string>();
    const toProcess = [memory.id];
    const processed = new Set<string>();
    
    for (let d = 0; d < depth; d++) {
      const nextLevel: string[] = [];
      
      for (const memId of toProcess) {
        if (processed.has(memId)) continue;
        processed.add(memId);
        
        const mem = memorySystem.memories[memId];
        if (!mem) continue;
        
        for (const assocId of mem.associations) {
          if (!processed.has(assocId) && assocId !== memory.id) {
            associated.add(assocId);
            nextLevel.push(assocId);
          }
        }
      }
      
      toProcess.length = 0;
      toProcess.push(...nextLevel);
    }
    
    return Array.from(associated)
      .map(id => memorySystem.memories[id])
      .filter(Boolean);
  }
  
  getMemoriesForNarrative(
    gameState: GameState,
    context: GameContext,
    maxMemories: number = 5
  ): {
    coreMemories: Memory[];
    relevantMemories: Memory[];
    activeThemes: Theme[];
  } {
    if (!gameState.memorySystem) {
      return {
        coreMemories: [],
        relevantMemories: [],
        activeThemes: []
      };
    }
    
    const coreMemories = this.getCoreMemories(gameState.memorySystem);
    const relevantMemories = this.getRelevantMemories(
      context, 
      gameState.memorySystem, 
      maxMemories
    );
    const activeThemes = this.themeDetector.getActiveThemes(gameState.memorySystem);
    
    return {
      coreMemories,
      relevantMemories,
      activeThemes
    };
  }
  
  updateMemoryAccess(memory: Memory, currentYear: number): void {
    memory.lastAccessed = currentYear;
    memory.accessCount += 1;
  }
}