import type { Stats } from './index';

// Trait System
export type TraitCategory = 'personality' | 'physical' | 'background' | 'inherited';

export interface TraitModifiers {
  statModifiers?: Partial<Stats>;
  choiceWeights?: Record<string, number>;
  narrativeTags?: string[];
}

export interface TraitDefinition {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;
  modifiers: TraitModifiers;
  incompatibleWith?: string[];
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
    startingTraits: string[];
    eventPools: string[];
  };
  characteristics: {
    costOfLiving: number;
    educationQuality: number;
    diversity: number;
    opportunities: string[];
  };
}

// Family Background System
export type FamilyStructure = 'two_parent' | 'single_parent' | 'extended_family' | 'adoptive' | 'foster';
export type SocioeconomicStatus = 'wealthy' | 'upper_middle' | 'middle' | 'working_class' | 'poor';

export interface ParentProfession {
  id: string;
  title: string;
  requiredStats: Partial<Stats>;
  socioeconomicStatus: SocioeconomicStatus;
  benefits: {
    connections: string[];
    knowledge: string[];
    opportunities: string[];
  };
}

export interface FamilyBackground {
  structure: FamilyStructure;
  socioeconomicStatus: SocioeconomicStatus;
  parentProfessions: {
    primary?: ParentProfession;
    secondary?: ParentProfession;
  };
  familySize: number;
  culturalBackground?: string;
  specialCircumstances?: string[];
}

// Era System
export interface EraDefinition {
  id: string;
  name: string;
  yearRange: [number, number];
  description: string;
  characteristics: {
    technology: {
      level: number;
      availableDevices: string[];
      communication: string[];
    };
    society: {
      values: string[];
      majorEvents: string[];
      economicClimate: 'boom' | 'stable' | 'recession' | 'depression';
    };
    education: {
      style: string;
      accessibility: number;
      costFactor: number;
    };
  };
  eventModifiers: {
    enabledEvents: string[];
    disabledEvents: string[];
    eventWeights: Record<string, number>;
  };
}

export interface GeneratedBackground {
  traits: string[];
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