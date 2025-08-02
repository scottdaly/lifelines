export interface Memory {
  id: string;
  eventId: string;
  type: 'core' | 'significant' | 'ordinary';
  emotionalValence: number; // -1 to 1 (negative to positive)
  intensity: number; // 0-1
  associations: string[]; // Related memory IDs
  lastAccessed: number; // Year last referenced
  accessCount: number;
  age: number; // Age when memory was formed
}

export interface Theme {
  id: string;
  name: string; // e.g., "academic_excellence", "family_conflict"
  relatedMemories: string[];
  strength: number; // 0-1, how prominent in character's life
  firstAppeared: number; // Year
  lastReinforced: number; // Year
}

export interface MemorySystem {
  memories: Record<string, Memory>;
  themes: Record<string, Theme>;
  coreMemoryIds: string[]; // Max 7-10 formative experiences
}

export interface GameContext {
  currentYear: number;
  currentAge: number;
  currentStage: string;
  recentEvents: Array<{
    title: string;
    tags: string[];
    emotionalImpact?: number;
  }>;
  currentEmotionalState?: number;
  activeRelationships: string[];
}

// Theme definitions
export const THEME_PATTERNS: Record<string, string[]> = {
  academic_excellence: ['study', 'achievement', 'academic', 'scholarship', 'grades', 'learning'],
  rebellious_spirit: ['rebel', 'conflict', 'defiant', 'independent', 'challenge', 'resist'],
  family_loyalty: ['family', 'parent', 'sibling', 'home', 'relative', 'household'],
  romantic_journey: ['love', 'romance', 'relationship', 'heartbreak', 'dating', 'partner'],
  creative_expression: ['art', 'creative', 'music', 'writing', 'imagination', 'artistic'],
  athletic_prowess: ['sport', 'athletic', 'competition', 'physical', 'fitness', 'team'],
  social_butterfly: ['friend', 'social', 'party', 'popular', 'group', 'network'],
  intellectual_curiosity: ['question', 'explore', 'discover', 'research', 'understand', 'curious'],
  career_ambition: ['career', 'job', 'work', 'professional', 'ambition', 'success'],
  adventurous_spirit: ['adventure', 'travel', 'explore', 'risk', 'new', 'exciting']
};

// Significant event tags that automatically create stronger memories
export const SIGNIFICANT_EVENT_TAGS = [
  'first_love',
  'graduation',
  'marriage',
  'divorce',
  'childbirth',
  'loss',
  'achievement',
  'trauma',
  'milestone',
  'breakthrough',
  'crisis',
  'transformation'
];

// Milestone ages that enhance memory significance
export const MILESTONE_AGES = [1, 5, 13, 16, 18, 21, 30, 40, 50, 65, 70, 80];