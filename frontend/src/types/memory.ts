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