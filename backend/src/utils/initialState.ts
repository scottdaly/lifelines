import type { GameState, Choice } from '../models/types.js';
import type { GeneratedBackground } from '../models/procedural.js';
import { GamePhase } from '../models/gamePhases.js';
import { generateEarlyLifeChoices } from './earlyLifeChoices.js';

export interface InitialStateParams {
  character: any;
  background: GeneratedBackground;
  relationships: any[];
  birthYear: number;
}

export async function generateInitialGameState(params: InitialStateParams): Promise<GameState> {
  const { character, background, relationships, birthYear } = params;
  
  // Generate birth narrative
  const birthNarrative = generateBirthNarrative(background);
  
  // Generate contextual first choices (hobby choices)
  const firstChoices = generateContextualFirstChoices(background);
  
  // Create complete initial game state
  const gameState: GameState = {
    seed: Math.random().toString(36).substring(2),
    currentYear: birthYear,
    stageLocalIndex: 0,
    character,
    relationships,
    events: [],
    pendingChoices: firstChoices,
    proceduralBackground: background,
    narrativePressure: 0,
    lastMilestoneAge: 0,
    currentSubTurn: undefined,
    currentPhase: GamePhase.EARLY_CHILDHOOD,
    phaseData: {
      earlyChildhood: {
        initialNarrativeShown: true
      }
    },
    narrativeHistory: birthNarrative
  };
  
  return gameState;
}

function generateBirthNarrative(background: GeneratedBackground): string[] {
  const { narrativeContext, birthplace, era, familyBackground } = background;
  
  const narrativeLines = [
    `[Born in ${birthplace.name}, ${era.name}]`,
    '',
    narrativeContext.familyStory,
    '',
    narrativeContext.environmentDescription,
    '',
    `Your traits: ${background.traits.join(', ')}`,
    '',
    '[AGE 0-8]',
    '',
    'Your earliest years stretch before you, full of potential. Every choice your family makes will shape who you become.',
    '',
    'What will your main hobby as a child be?'
  ];
  
  return narrativeLines;
}

function generateContextualFirstChoices(background: GeneratedBackground): Choice[] {
  // Use the existing early life choice generator but with better context
  const choices = generateEarlyLifeChoices(background);
  
  // Ensure choices are properly contextualized for the family's situation
  return choices.map(choice => ({
    ...choice,
    tags: [...(choice.tags || []), 'early_childhood', 'initial']
  }));
}