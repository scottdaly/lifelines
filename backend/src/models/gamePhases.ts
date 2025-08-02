import type { GameState, PlayerChoice } from './types.js';

export enum GamePhase {
  CHARACTER_CREATION = 'character_creation',
  EARLY_CHILDHOOD = 'early_childhood',  // Ages 0-8
  CHILDHOOD = 'childhood',               // Ages 9-12
  ADOLESCENCE = 'adolescence',           // Ages 13-17
  YOUNG_ADULT = 'young_adult',           // Ages 18-25
  ADULT = 'adult',                       // Ages 26-64
  SENIOR = 'senior'                      // Ages 65+
}

export interface PhaseData {
  earlyChildhood?: {
    hobbyChoice?: string;
    hobbyLabel?: string;
    developmentFocus?: {
      physical: number;
      cognitive: number;
      social: number;
      creative: number;
      emotional: number;
    };
    initialNarrativeShown?: boolean;
  };
  childhood?: {
    schoolType?: string;
    primaryInterest?: string;
    firstTurnShown?: boolean;
  };
  adolescence?: {
    highSchoolPath?: string;
    firstJob?: string;
  };
  // Add more phase-specific data as needed
}

export interface PhaseTransition {
  fromPhase: GamePhase;
  toPhase: GamePhase;
  trigger: 'age' | 'event' | 'choice';
  ageThreshold?: number;
}

export interface TurnResult {
  narrativeLines: string[];
  newGameState: GameState;
  transitionInfo: {
    turnType?: 'normal' | 'milestone' | 'sub-turn' | 'time-skip';
    yearsProgressed?: number;
    ageChange?: {
      previousAge: number;
      newAge: number;
      narrative: string;
    };
    timeSpan?: string;
    phaseTransition?: {
      from: GamePhase;
      to: GamePhase;
    };
  };
}

export interface PhaseHandler {
  phase: GamePhase;
  processTurn(gameState: GameState, playerChoice: PlayerChoice): Promise<TurnResult>;
  generateInitialChoices?(gameState: GameState): Promise<any[]>;
  canTransitionTo?(newPhase: GamePhase, gameState: GameState): boolean;
}

// Phase transition rules
export const PHASE_TRANSITIONS: PhaseTransition[] = [
  {
    fromPhase: GamePhase.CHARACTER_CREATION,
    toPhase: GamePhase.EARLY_CHILDHOOD,
    trigger: 'event'
  },
  {
    fromPhase: GamePhase.EARLY_CHILDHOOD,
    toPhase: GamePhase.CHILDHOOD,
    trigger: 'age',
    ageThreshold: 9  // Transition when reaching age 9
  },
  {
    fromPhase: GamePhase.CHILDHOOD,
    toPhase: GamePhase.ADOLESCENCE,
    trigger: 'age',
    ageThreshold: 13
  },
  {
    fromPhase: GamePhase.ADOLESCENCE,
    toPhase: GamePhase.YOUNG_ADULT,
    trigger: 'age',
    ageThreshold: 18
  },
  {
    fromPhase: GamePhase.YOUNG_ADULT,
    toPhase: GamePhase.ADULT,
    trigger: 'age',
    ageThreshold: 26
  },
  {
    fromPhase: GamePhase.ADULT,
    toPhase: GamePhase.SENIOR,
    trigger: 'age',
    ageThreshold: 65
  }
];

// Helper functions
export function getPhaseForAge(age: number): GamePhase {
  if (age <= 8) return GamePhase.EARLY_CHILDHOOD;
  if (age <= 12) return GamePhase.CHILDHOOD;
  if (age <= 17) return GamePhase.ADOLESCENCE;
  if (age <= 25) return GamePhase.YOUNG_ADULT;
  if (age <= 64) return GamePhase.ADULT;
  return GamePhase.SENIOR;
}

export function checkPhaseTransition(gameState: GameState): GamePhase | null {
  const currentPhase = gameState.currentPhase || getPhaseForAge(getCurrentAge(gameState));
  const age = getCurrentAge(gameState);
  
  const applicableTransitions = PHASE_TRANSITIONS.filter(t => 
    t.fromPhase === currentPhase && 
    t.trigger === 'age' &&
    t.ageThreshold !== undefined &&
    age >= t.ageThreshold
  );
  
  if (applicableTransitions.length > 0) {
    return applicableTransitions[0].toPhase;
  }
  
  return null;
}

function getCurrentAge(gameState: GameState): number {
  return gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
}