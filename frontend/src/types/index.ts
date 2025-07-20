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
  subTurns?: string[];
  promptTags: string[];
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
};

export interface Choice {
  id: string;
  label: string;
  tags?: string[];
}

export interface TurnResponse {
  narrativeLines: string[];
  toast: {
    summary: string;
    deltas: Partial<Stats>;
    relHighlights: string[];
  };
  transitionInfo: {
    ageChange?: {
      previousAge: number;
      newAge: number;
      narrative: string;
    };
    scenarioContext: string;
  };
  newGameState: GameState;
}

export interface PlayerChoice {
  id: string;
  label?: string;
}