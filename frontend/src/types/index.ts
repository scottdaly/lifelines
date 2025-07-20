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
  | "tween"
  | "highSchool"
  | "youngAdult"
  | "adult"
  | "senior";

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
}