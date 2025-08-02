import type { Stats } from './types.js';

// Trait System
export type TraitCategory = 'personality' | 'physical' | 'background' | 'inherited';

export interface TraitModifiers {
  statModifiers?: Partial<Stats>;
  choiceWeights?: Record<string, number>; // Affects likelihood of certain choice types
  narrativeTags?: string[]; // Tags that influence narrative generation
}

export interface TraitDefinition {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;
  modifiers: TraitModifiers;
  incompatibleWith?: string[]; // Trait IDs that can't coexist
  evolvesInto?: {
    traitId: string;
    conditions: {
      minAge?: number;
      minStats?: Partial<Stats>;
      requiredEvents?: string[];
    };
  }[];
}

// Birthplace System
export type BirthplaceType = 'major_city' | 'small_town' | 'rural' | 'suburb';

export interface BirthplaceDefinition {
  id: string;
  name: string;
  type: BirthplaceType;
  population: string;
  description: string;
  modifiers: {
    statModifiers: Partial<Stats>;
    startingTraits: string[]; // Trait IDs
    eventPools: string[]; // Event pool IDs available in this location
  };
  characteristics: {
    costOfLiving: number; // 1-10 scale
    educationQuality: number; // 1-10 scale
    diversity: number; // 1-10 scale
    opportunities: string[]; // Types of opportunities available
  };
}

// Family Background System
export type FamilyStructure = 'two_parent' | 'single_parent' | 'extended_family' | 'adoptive' | 'foster';
export type SocioeconomicStatus = 'wealthy' | 'upper_middle' | 'middle' | 'working_class' | 'poor';

export interface ParentProfession {
  id: string;
  title: string;
  requiredStats: Partial<Stats>; // Minimum stats for parent to have this profession
  socioeconomicStatus: SocioeconomicStatus;
  benefits: {
    connections: string[]; // Industry connections
    knowledge: string[]; // Areas of expertise passed down
    opportunities: string[]; // Special opportunities for child
  };
}

export interface FamilyBackground {
  structure: FamilyStructure;
  socioeconomicStatus: SocioeconomicStatus;
  parentProfessions: {
    primary?: ParentProfession;
    secondary?: ParentProfession;
  };
  familySize: number; // Number of siblings
  culturalBackground?: string;
  specialCircumstances?: string[]; // e.g., "military family", "immigrant family"
}

// Era System
export interface EraDefinition {
  id: string;
  name: string;
  yearRange: [number, number];
  description: string;
  characteristics: {
    technology: {
      level: number; // 1-10 scale
      availableDevices: string[];
      communication: string[]; // Available communication methods
    };
    society: {
      values: string[];
      majorEvents: string[];
      economicClimate: 'boom' | 'stable' | 'recession' | 'depression';
    };
    education: {
      style: string;
      accessibility: number; // 1-10 scale
      costFactor: number; // Multiplier for education costs
    };
  };
  eventModifiers: {
    enabledEvents: string[]; // Event IDs only available in this era
    disabledEvents: string[]; // Event IDs not available in this era
    eventWeights: Record<string, number>; // Multipliers for event probability
  };
}

// Procedural Generation Helpers
export interface ProceduralConfig {
  traits: TraitDefinition[];
  birthplaces: BirthplaceDefinition[];
  professions: ParentProfession[];
  eras: EraDefinition[];
}

export interface GeneratedBackground {
  traits: string[]; // Selected trait IDs
  birthplace: BirthplaceDefinition;
  familyBackground: FamilyBackground;
  era: EraDefinition;
  startingStatModifiers: Partial<Stats>;
  narrativeContext: {
    familyStory: string;
    environmentDescription: string;
    culturalContext: string;
  };
}

// Stat correlation system
export interface StatCorrelation {
  parentStat: keyof Stats;
  childStat: keyof Stats;
  correlationStrength: number; // 0-1, how much parent stat affects child
  variance: number; // Random variance to add
}

export const STAT_CORRELATIONS: StatCorrelation[] = [
  { parentStat: 'intelligence', childStat: 'intelligence', correlationStrength: 0.4, variance: 0.3 },
  { parentStat: 'charisma', childStat: 'charisma', correlationStrength: 0.3, variance: 0.4 },
  { parentStat: 'strength', childStat: 'strength', correlationStrength: 0.35, variance: 0.35 },
  { parentStat: 'creativity', childStat: 'creativity', correlationStrength: 0.3, variance: 0.4 },
  { parentStat: 'health', childStat: 'health', correlationStrength: 0.4, variance: 0.3 }
];