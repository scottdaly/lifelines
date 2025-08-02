export type Stats = {
  intelligence: number;
  charisma: number;
  strength: number;
  creativity: number;
  luck: number;
  health: number;
  wealth: number;
};

export type RelType =
  | "parent"
  | "sibling"
  | "friend"
  | "rival"
  | "mentor"
  | "romantic"
  | "spouse"
  | "coworker"
  | "child";

export type RelStats = {
  intimacy: number;
  trust: number;
  attraction: number;
  conflict: number;
};

export type NPC = {
  id: string;
  name: string;
  age: number;
  gender: string;
  traits: string[];
  stats: Partial<Stats>;
};

export type Relationship = {
  npc: NPC;
  relType: RelType;
  relStats: RelStats;
  history: LifeEvent[];
  status: "active" | "estranged" | "ended" | "deceased";
};

export type LifeEvent = {
  id: string;
  year: number;
  title: string;
  description: string;
  statChanges: Partial<Stats>;
  tags: string[];
  affectedRelationships?: {
    npcId: string;
    relStatDeltas: Partial<RelStats>;
    narrativeImpact: string;
  }[];
};

export type LifeStage =
  | "infancy"
  | "earlyChild"
  | "middleChild"
  | "earlyLife"
  | "tween"
  | "highSchool"
  | "youngAdult"
  | "adult"
  | "senior";

export type TimeBlockCategory = 
  | "physical"      // Physical development, motor skills, health
  | "cognitive"     // Learning, curiosity, problem-solving
  | "social"        // Family bonds, early friendships
  | "creative"      // Imagination, play, arts
  | "emotional";    // Attachment, confidence, security

export interface TimeBlockAllocation {
  physical: number;    // 1-4 blocks
  cognitive: number;   // 1-4 blocks
  social: number;      // 1-4 blocks
  creative: number;    // 1-4 blocks
  emotional: number;   // 1-4 blocks
  // Total must equal 10
}

export interface StageConfig {
  name: LifeStage;
  turnSpan: number;
  turnSpanVariance?: number; // Random variance in years (e.g., ±1 year)
  subTurns?: string[];
  promptTags: string[];
  eventDensity: 'sparse' | 'normal' | 'dense'; // How often significant events occur
  milestoneAges?: number[]; // Special ages that always trigger a turn
  dynamicSubTurnTriggers?: string[]; // Event tags that can trigger sub-turns
}

import type { GeneratedBackground } from './procedural';
import type { MemorySystem } from './memory';

export const GamePhase = {
  CHARACTER_CREATION: 'character_creation',
  EARLY_CHILDHOOD: 'early_childhood',  // Ages 0-8
  CHILDHOOD: 'childhood',               // Ages 9-12
  ADOLESCENCE: 'adolescence',           // Ages 13-17
  YOUNG_ADULT: 'young_adult',           // Ages 18-25
  ADULT: 'adult',                       // Ages 26-64
  SENIOR: 'senior'                      // Ages 65+
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export interface PhaseData {
  earlyChildhood?: {
    hobbyChoice?: string;
    hobbyLabel?: string;
    developmentFocus?: TimeBlockAllocation;
    initialNarrativeShown?: boolean;
  };
  childhood?: {
    schoolType?: string;
    primaryInterest?: string;
  };
  adolescence?: {
    highSchoolPath?: string;
    firstJob?: string;
  };
  // Add more phase-specific data as needed
}

export type GameState = {
  seed: string;
  currentYear: number;
  stageLocalIndex: number;
  character: {
    id: string;
    name: string;
    gender: string;
    dob: string;
    birthplace: string;
    stats: Stats;
    traits: string[];
    inventory: Record<string, number>;
  };
  relationships: Relationship[];
  events: LifeEvent[];
  pendingChoices: Choice[];
  proceduralBackground?: GeneratedBackground;
  narrativePressure?: number; // 0-1, tracks need for dramatic events
  lastMilestoneAge?: number; // Track last milestone for proper progression
  currentSubTurn?: string; // Track current sub-turn if in one
  memorySystem?: MemorySystem; // Hierarchical memory system
  timeBlockAllocations?: TimeBlockAllocation; // Early childhood focus areas
  parentPerspective?: boolean; // Whether narrating from parent's POV
  currentPhase?: GamePhase; // Current game phase
  phaseData?: PhaseData; // Phase-specific data
  narrativeHistory?: string[]; // Complete narrative history (for initial state)
};

export interface Choice {
  id: string;
  label: string;
  tags?: string[];
}

export interface TurnResponse {
  narrativeLines: string[];
  transitionInfo: {
    ageChange?: {
      previousAge: number;
      newAge: number;
      narrative: string;
    };
    turnType?: 'normal' | 'milestone' | 'sub-turn' | 'time-skip';
    timeSpan?: string; // e.g., "3 years", "Fall semester"
    yearsProgressed?: number;
    phaseTransition?: {
      from: GamePhase;
      to: GamePhase;
    };
  };
  newGameState: GameState;
}

export interface DynamicTurnContext {
  isMilestone: boolean;
  isSubTurn: boolean;
  subTurnName?: string;
  yearsProgressed: number;
  narrativePressure: number; // 0-1, higher means more dramatic events needed
  triggeredBy?: string; // Event tag that triggered this turn
}

export interface PlayerChoice {
  id: string;
  label?: string;
  isCustom?: boolean;
}