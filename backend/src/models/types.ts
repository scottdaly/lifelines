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

export interface TimeBlockEffect {
  statModifiers: Partial<Stats>;
  traitProbabilities: { trait: string; probability: number }[];
  narrativeThemes: string[];
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

export const STAGES: StageConfig[] = [
  {
    name: "infancy",
    turnSpan: 3,
    turnSpanVariance: 0,
    promptTags: ["baby", "toddler", "early development", "first words", "first steps", "parent perspective"],
    eventDensity: 'normal',
    milestoneAges: [1, 3],
    dynamicSubTurnTriggers: ["first_words", "first_steps", "health_scare", "family_change"]
  },
  {
    name: "earlyChild",
    turnSpan: 2,
    turnSpanVariance: 0,
    promptTags: ["preschool", "early childhood", "learning", "play", "family life", "emerging personality"],
    eventDensity: 'normal',
    milestoneAges: [5],
    dynamicSubTurnTriggers: ["preschool_start", "sibling_birth", "family_move", "early_talent"]
  },
  {
    name: "middleChild",
    turnSpan: 3,
    turnSpanVariance: 0,
    promptTags: ["elementary school", "friendships", "hobbies", "family dynamics", "growing independence"],
    eventDensity: 'normal',
    milestoneAges: [8],
    dynamicSubTurnTriggers: ["first_day_school", "best_friend", "family_crisis", "formative_moment"]
  },
  {
    name: "tween",
    turnSpan: 4,
    turnSpanVariance: 0,
    promptTags: ["pre-teen", "identity formation", "school life", "growing independence", "peer relationships"],
    eventDensity: 'normal',
    milestoneAges: [12],
    dynamicSubTurnTriggers: ["first_crush", "major_conflict", "identity_moment", "school_transition", "friendship_drama"]
  },
  {
    name: "highSchool",
    turnSpan: 1,
    subTurns: ["Fall", "Spring", "Summer"],
    promptTags: ["academics", "romance", "future planning", "social life"],
    eventDensity: 'dense',
    milestoneAges: [16, 18],
    dynamicSubTurnTriggers: ["relationship_start", "college_prep", "major_decision"]
  },
  {
    name: "youngAdult",
    turnSpan: 2,
    turnSpanVariance: 1,
    promptTags: ["career", "independence", "relationships", "education"],
    eventDensity: 'normal',
    milestoneAges: [21, 25],
    dynamicSubTurnTriggers: ["graduation", "first_job", "engagement", "career_change"]
  },
  {
    name: "adult",
    turnSpan: 3,
    turnSpanVariance: 2,
    promptTags: ["career", "family", "stability", "achievements"],
    eventDensity: 'normal',
    milestoneAges: [30, 40, 50],
    dynamicSubTurnTriggers: ["marriage", "childbirth", "divorce", "career_milestone", "loss"]
  },
  {
    name: "senior",
    turnSpan: 2,
    turnSpanVariance: 1,
    promptTags: ["legacy", "reflection", "health", "wisdom"],
    eventDensity: 'normal',
    milestoneAges: [65, 70, 80],
    dynamicSubTurnTriggers: ["retirement", "grandchild", "health_crisis", "loss_of_spouse"]
  }
];

import type { GeneratedBackground } from './procedural.js';
import type { MemorySystem } from './memory.js';
import type { GamePhase, PhaseData } from './gamePhases.js';

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