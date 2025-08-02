import type { LifeEvent, GameState } from '../models/types.js';
import type { Memory, MemorySystem } from '../models/memory.js';
import { SIGNIFICANT_EVENT_TAGS, MILESTONE_AGES } from '../models/memory.js';

export class MemoryProcessor {
  evaluateEvent(event: LifeEvent, gameState: GameState): Memory {
    const age = this.calculateAge(gameState);
    const significance = this.calculateSignificance(event, gameState);
    const emotionalValence = this.assessEmotionalImpact(event);
    const associations = this.findAssociations(event, gameState);
    
    return {
      id: `mem_${event.id}`,
      eventId: event.id,
      type: this.determineMemoryType(significance, age),
      emotionalValence,
      intensity: significance,
      associations,
      lastAccessed: gameState.currentYear,
      accessCount: 0,
      age
    };
  }
  
  private calculateAge(gameState: GameState): number {
    return gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  }
  
  private calculateSignificance(event: LifeEvent, gameState: GameState): number {
    let score = 0;
    
    // Large stat changes = significant
    const totalStatChange = Object.values(event.statChanges || {})
      .reduce((sum, val) => sum + Math.abs(val), 0);
    score += Math.min(totalStatChange / 40, 0.5); // Max 0.5 from stats
    
    // Relationship changes = significant
    if (event.affectedRelationships && event.affectedRelationships.length > 0) {
      score += 0.2 * Math.min(event.affectedRelationships.length, 2); // Max 0.4
    }
    
    // Milestone ages = automatic significance boost
    const age = this.calculateAge(gameState);
    if (MILESTONE_AGES.includes(age)) {
      score += 0.3;
    }
    
    // Tagged significant events
    const hasSignificantTag = event.tags.some(tag => 
      SIGNIFICANT_EVENT_TAGS.includes(tag)
    );
    if (hasSignificantTag) {
      score += 0.4;
    }
    
    // Early life events are more formative
    if (age <= 10) {
      score *= 1.3;
    } else if (age <= 18) {
      score *= 1.15;
    }
    
    // Random factor for unexpected significance
    score += Math.random() * 0.1;
    
    return Math.min(score, 1);
  }
  
  private determineMemoryType(
    significance: number, 
    age: number
  ): 'core' | 'significant' | 'ordinary' {
    // Early formative years more likely to create core memories
    const coreThreshold = age <= 10 ? 0.7 : age <= 18 ? 0.8 : 0.9;
    
    if (significance >= coreThreshold) {
      return 'core';
    } else if (significance >= 0.5) {
      return 'significant';
    } else {
      return 'ordinary';
    }
  }
  
  private assessEmotionalImpact(event: LifeEvent): number {
    let valence = 0;
    
    // Analyze stat changes for emotional impact
    const statChanges = event.statChanges || {};
    
    // Positive stats
    valence += (statChanges.health || 0) * 0.02;
    valence += (statChanges.wealth || 0) * 0.01;
    valence += (statChanges.charisma || 0) * 0.015;
    valence += (statChanges.intelligence || 0) * 0.01;
    valence += (statChanges.creativity || 0) * 0.01;
    valence += (statChanges.luck || 0) * 0.015;
    
    // Analyze relationship changes
    if (event.affectedRelationships) {
      for (const rel of event.affectedRelationships) {
        const relChanges = rel.relStatDeltas || {};
        valence += (relChanges.intimacy || 0) * 0.01;
        valence += (relChanges.trust || 0) * 0.01;
        valence -= (relChanges.conflict || 0) * 0.01;
      }
    }
    
    // Analyze tags for emotional content
    const positiveEmotionalTags = ['achievement', 'love', 'success', 'joy', 'celebration'];
    const negativeEmotionalTags = ['loss', 'failure', 'conflict', 'trauma', 'crisis'];
    
    const positiveTags = event.tags.filter(tag => 
      positiveEmotionalTags.includes(tag)
    ).length;
    const negativeTags = event.tags.filter(tag => 
      negativeEmotionalTags.includes(tag)
    ).length;
    
    valence += positiveTags * 0.3;
    valence -= negativeTags * 0.3;
    
    // Clamp to -1 to 1 range
    return Math.max(-1, Math.min(1, valence));
  }
  
  private findAssociations(event: LifeEvent, gameState: GameState): string[] {
    const associations: string[] = [];
    
    if (!gameState.memorySystem) return associations;
    
    const memories = Object.values(gameState.memorySystem.memories);
    
    for (const memory of memories) {
      const relatedEvent = gameState.events.find(e => e.id === memory.eventId);
      if (!relatedEvent || relatedEvent.id === event.id) continue;
      
      // Check for shared tags
      const sharedTags = event.tags.filter(tag => 
        relatedEvent.tags.includes(tag)
      );
      
      // Check for shared relationships
      const eventNPCs = (event.affectedRelationships || []).map(r => r.npcId);
      const memoryNPCs = (relatedEvent.affectedRelationships || []).map(r => r.npcId);
      const sharedNPCs = eventNPCs.filter(npc => memoryNPCs.includes(npc));
      
      // Strong association if multiple connections
      if (sharedTags.length >= 2 || sharedNPCs.length > 0) {
        associations.push(memory.id);
      }
      
      // Temporal association (events close in time)
      const yearDiff = Math.abs(event.year - relatedEvent.year);
      if (yearDiff <= 1 && sharedTags.length > 0) {
        associations.push(memory.id);
      }
    }
    
    // Limit associations to prevent memory bloat
    return associations.slice(0, 5);
  }
  
  processMemoryDecay(memorySystem: MemorySystem, currentYear: number): void {
    const memories = Object.values(memorySystem.memories);
    const maxMemories = 100;
    
    // If under limit, no decay needed
    if (memories.length <= maxMemories) return;
    
    // Sort memories by importance for removal
    const candidatesForRemoval = memories
      .filter(m => m.type === 'ordinary')
      .sort((a, b) => {
        // Keep recently accessed memories
        const aRecency = currentYear - a.lastAccessed;
        const bRecency = currentYear - b.lastAccessed;
        
        // Keep high intensity memories
        const aScore = a.intensity - (aRecency * 0.1);
        const bScore = b.intensity - (bRecency * 0.1);
        
        return aScore - bScore;
      });
    
    // Remove least important memories
    const toRemove = candidatesForRemoval.slice(0, memories.length - maxMemories);
    
    for (const memory of toRemove) {
      delete memorySystem.memories[memory.id];
      
      // Remove from core memories if present
      memorySystem.coreMemoryIds = memorySystem.coreMemoryIds.filter(
        id => id !== memory.id
      );
      
      // Remove from theme associations
      for (const theme of Object.values(memorySystem.themes)) {
        theme.relatedMemories = theme.relatedMemories.filter(
          id => id !== memory.id
        );
      }
    }
  }
  
  updateCoreMemories(memory: Memory, memorySystem: MemorySystem): void {
    if (memory.type !== 'core') return;
    
    // Add to core memories
    if (!memorySystem.coreMemoryIds.includes(memory.id)) {
      memorySystem.coreMemoryIds.push(memory.id);
    }
    
    // Maintain core memory limit
    const maxCoreMemories = 10;
    if (memorySystem.coreMemoryIds.length > maxCoreMemories) {
      // Remove oldest core memory (but keep it as significant)
      const oldestCoreId = memorySystem.coreMemoryIds.shift();
      if (oldestCoreId && memorySystem.memories[oldestCoreId]) {
        memorySystem.memories[oldestCoreId].type = 'significant';
      }
    }
  }
}