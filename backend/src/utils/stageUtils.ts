import type { GameState, StageConfig, DynamicTurnContext } from '../models/types.js';
import { STAGES } from '../models/types.js';
import { DynamicTurnCalculator } from './dynamicTurns.js';

export function getStageConfig(gameState: GameState): StageConfig {
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  if (age < 3) return STAGES[0]; // infancy (0-2)
  if (age < 5) return STAGES[1]; // earlyChild (3-4)
  if (age < 8) return STAGES[2]; // middleChild (5-7)
  if (age < 13) return STAGES[3]; // tween (8-12)
  if (age < 18) return STAGES[4]; // highSchool
  if (age < 25) return STAGES[5]; // youngAdult
  if (age < 65) return STAGES[6]; // adult
  return STAGES[7]; // senior
}

export function advanceTime(gameState: GameState, forceDynamic: boolean = true): GameState {
  const updatedState = { ...gameState };
  
  if (forceDynamic) {
    // Use dynamic turn calculator
    const calculator = new DynamicTurnCalculator(gameState);
    const turnContext = calculator.calculateNextTurn();
    
    if (turnContext.isSubTurn && turnContext.yearsProgressed === 0) {
      // We're in a sub-turn, just advance the index
      updatedState.stageLocalIndex++;
      updatedState.currentSubTurn = turnContext.subTurnName;
    } else {
      // Normal progression
      updatedState.currentYear += turnContext.yearsProgressed;
      updatedState.stageLocalIndex = 0;
      updatedState.currentSubTurn = undefined;
      
      // Update narrative pressure
      updatedState.narrativePressure = turnContext.narrativePressure;
      
      // Track milestone
      if (turnContext.isMilestone) {
        const newAge = updatedState.currentYear - parseInt(updatedState.character.dob.split('-')[0]);
        updatedState.lastMilestoneAge = newAge;
      }
    }
    
    return updatedState;
  } else {
    // Legacy behavior for compatibility
    const stageConfig = getStageConfig(gameState);
    
    if (stageConfig.subTurns) {
      updatedState.stageLocalIndex++;
      if (updatedState.stageLocalIndex >= stageConfig.subTurns.length) {
        updatedState.currentYear += stageConfig.turnSpan;
        updatedState.stageLocalIndex = 0;
      }
    } else {
      updatedState.currentYear += stageConfig.turnSpan;
    }
    
    return updatedState;
  }
}

export function getDynamicTurnContext(gameState: GameState): DynamicTurnContext {
  const calculator = new DynamicTurnCalculator(gameState);
  return calculator.calculateNextTurn();
}