import type { GameState, PlayerChoice } from '../models/types.js';
import type { PhaseHandler, GamePhase, TurnResult } from '../models/gamePhases.js';
import { callOpenAI } from '../utils/llm.js';
import { getStageConfig, getDynamicTurnContext } from '../utils/stageUtils.js';

export abstract class BasePhaseHandler implements PhaseHandler {
  abstract phase: GamePhase;
  
  abstract processTurn(gameState: GameState, playerChoice: PlayerChoice): Promise<TurnResult>;
  
  async generateInitialChoices?(gameState: GameState): Promise<any[]> {
    // Default implementation - can be overridden
    return [];
  }
  
  canTransitionTo?(newPhase: GamePhase, gameState: GameState): boolean {
    // Default implementation - can be overridden
    return true;
  }
  
  protected getCurrentAge(gameState: GameState): number {
    return gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  }
  
  protected async callLLM(
    gameState: GameState, 
    playerChoice: PlayerChoice,
    overrides?: any
  ) {
    const stageConfig = getStageConfig(gameState);
    const turnContext = getDynamicTurnContext(gameState);
    
    return callOpenAI({
      gameState,
      playerChoice,
      stageConfig,
      turnContext,
      ...overrides
    });
  }
}