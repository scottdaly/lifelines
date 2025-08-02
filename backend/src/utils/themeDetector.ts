import type { Memory, Theme, MemorySystem } from '../models/memory.js';
import type { LifeEvent, GameState } from '../models/types.js';
import { THEME_PATTERNS } from '../models/memory.js';

export class ThemeDetector {
  detectThemes(memory: Memory, event: LifeEvent, gameState: GameState): string[] {
    const themes: string[] = [];
    
    for (const [themeId, keywords] of Object.entries(THEME_PATTERNS)) {
      const score = this.calculateThemeScore(event, keywords);
      
      // Strong match requires multiple keyword hits
      if (score >= 2) {
        themes.push(themeId);
      }
    }
    
    return themes;
  }
  
  private calculateThemeScore(event: LifeEvent, keywords: string[]): number {
    let score = 0;
    
    // Check event tags
    for (const keyword of keywords) {
      if (event.tags.includes(keyword)) {
        score += 2; // Tags are strong indicators
      }
    }
    
    // Check title and description
    const contentToCheck = (
      event.title.toLowerCase() + ' ' + 
      event.description.toLowerCase()
    );
    
    for (const keyword of keywords) {
      if (contentToCheck.includes(keyword)) {
        score += 1;
      }
    }
    
    return score;
  }
  
  updateThemes(
    memory: Memory, 
    detectedThemes: string[], 
    memorySystem: MemorySystem,
    currentYear: number
  ): void {
    for (const themeId of detectedThemes) {
      if (!memorySystem.themes[themeId]) {
        // Create new theme
        memorySystem.themes[themeId] = {
          id: themeId,
          name: themeId,
          relatedMemories: [memory.id],
          strength: 0.2, // Start with low strength
          firstAppeared: currentYear,
          lastReinforced: currentYear
        };
      } else {
        // Update existing theme
        const theme = memorySystem.themes[themeId];
        
        // Add memory if not already linked
        if (!theme.relatedMemories.includes(memory.id)) {
          theme.relatedMemories.push(memory.id);
        }
        
        // Increase strength (up to 1.0)
        theme.strength = Math.min(1.0, theme.strength + 0.1);
        
        // Update last reinforced
        theme.lastReinforced = currentYear;
      }
    }
    
    // Decay unused themes
    this.decayThemes(memorySystem, currentYear);
  }
  
  private decayThemes(memorySystem: MemorySystem, currentYear: number): void {
    for (const theme of Object.values(memorySystem.themes)) {
      const yearsSinceReinforced = currentYear - theme.lastReinforced;
      
      // Decay strength if theme hasn't been reinforced recently
      if (yearsSinceReinforced > 5) {
        theme.strength = Math.max(0, theme.strength - 0.05 * yearsSinceReinforced);
      }
      
      // Remove very weak themes
      if (theme.strength < 0.1) {
        delete memorySystem.themes[theme.id];
      }
    }
  }
  
  getActiveThemes(memorySystem: MemorySystem): Theme[] {
    return Object.values(memorySystem.themes)
      .filter(theme => theme.strength >= 0.3)
      .sort((a, b) => b.strength - a.strength);
  }
  
  getThemeNarrative(theme: Theme): string {
    const narratives: Record<string, string> = {
      academic_excellence: "Your dedication to learning and achievement",
      rebellious_spirit: "Your tendency to challenge authority and norms",
      family_loyalty: "Your deep connections to family",
      romantic_journey: "Your experiences with love and relationships",
      creative_expression: "Your artistic and creative pursuits",
      athletic_prowess: "Your physical abilities and competitive spirit",
      social_butterfly: "Your vibrant social life and connections",
      intellectual_curiosity: "Your quest for knowledge and understanding",
      career_ambition: "Your professional drive and aspirations",
      adventurous_spirit: "Your love of exploration and new experiences"
    };
    
    return narratives[theme.id] || `Your experience with ${theme.name.replace('_', ' ')}`;
  }
  
  findRelatedThemes(theme: Theme, memorySystem: MemorySystem): Theme[] {
    const related: Theme[] = [];
    
    // Find themes that share memories
    for (const otherTheme of Object.values(memorySystem.themes)) {
      if (otherTheme.id === theme.id) continue;
      
      const sharedMemories = theme.relatedMemories.filter(memId =>
        otherTheme.relatedMemories.includes(memId)
      );
      
      if (sharedMemories.length >= 2) {
        related.push(otherTheme);
      }
    }
    
    return related;
  }
  
  suggestEmergingThemes(
    recentMemories: Memory[], 
    memorySystem: MemorySystem,
    gameState: GameState
  ): string[] {
    const themeCounts: Record<string, number> = {};
    
    // Count theme occurrences in recent memories
    for (const memory of recentMemories) {
      const event = gameState.events.find(e => e.id === memory.eventId);
      if (!event) continue;
      
      for (const [themeId, keywords] of Object.entries(THEME_PATTERNS)) {
        // Skip already strong themes
        if (memorySystem.themes[themeId]?.strength > 0.5) continue;
        
        const score = this.calculateThemeScore(event, keywords);
        if (score > 0) {
          themeCounts[themeId] = (themeCounts[themeId] || 0) + score;
        }
      }
    }
    
    // Return themes that are emerging (appear multiple times)
    return Object.entries(themeCounts)
      .filter(([_, count]) => count >= 3)
      .map(([themeId]) => themeId);
  }
}