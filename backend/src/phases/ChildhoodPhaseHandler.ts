import type { GameState, PlayerChoice, LifeEvent } from '../models/types.js';
import type { TurnResult } from '../models/gamePhases.js';
import { GamePhase } from '../models/gamePhases.js';
import { BasePhaseHandler } from './BasePhaseHandler.js';
import { applyStatChanges, applyRelationshipChanges } from '../utils/gameStateUtils.js';
import { processMemory } from '../utils/memoryUtils.js';
import { advanceTime } from '../utils/stageUtils.js';

export class ChildhoodPhaseHandler extends BasePhaseHandler {
  phase = GamePhase.CHILDHOOD;
  
  async processTurn(gameState: GameState, playerChoice: PlayerChoice): Promise<TurnResult> {
    // Check if this is the first turn in childhood phase (entering from age 9)
    const currentAge = this.getCurrentAge(gameState);
    const isFirstTurn = currentAge === 9 && !gameState.phaseData?.childhood?.enteredPhase;
    
    // For childhood phase (9-12), use standard turn processing
    const llmResponse = await this.callLLM(gameState, playerChoice);
    
    const event: LifeEvent = {
      id: `event_${Date.now()}`,
      year: gameState.currentYear,
      title: llmResponse.appliedEvent.title,
      description: llmResponse.appliedEvent.description,
      statChanges: llmResponse.appliedEvent.statChanges,
      tags: llmResponse.appliedEvent.tags,
      affectedRelationships: llmResponse.appliedEvent.affectedRelationships
    };
    
    let updatedGameState = { ...gameState };
    updatedGameState = applyStatChanges(updatedGameState, event.statChanges);
    
    if (event.affectedRelationships) {
      updatedGameState = applyRelationshipChanges(
        updatedGameState,
        event.affectedRelationships
      );
    }
    
    updatedGameState.events.push(event);
    updatedGameState = processMemory(updatedGameState, event);
    
    // Get current age before advancing time
    const previousAge = this.getCurrentAge(updatedGameState);
    
    if (isFirstTurn) {
      // For the first turn, jump from age 9 to age 13 (covering the entire 9-12 period)
      updatedGameState.currentYear += 4; // From age 9 to age 13
      
      // Mark that we've entered the childhood phase
      if (!updatedGameState.phaseData) {
        updatedGameState.phaseData = {};
      }
      if (!updatedGameState.phaseData.childhood) {
        updatedGameState.phaseData.childhood = {};
      }
      updatedGameState.phaseData.childhood.enteredPhase = true;
    } else {
      // This shouldn't happen - childhood phase should be a single turn
      // But if it does, just advance normally
      updatedGameState = advanceTime(updatedGameState);
    }
    
    updatedGameState.pendingChoices = llmResponse.nextChoices;
    
    // Get new age after advancing time
    const newAge = this.getCurrentAge(updatedGameState);
    
    // Build narrative with proper age marker
    const narrativeLines: string[] = [];
    
    // Add age marker if this is the first turn in childhood phase
    if (isFirstTurn) {
      // Don't add age marker here - let the frontend handle it via ageChange
    }
    
    // Add the LLM narrative
    narrativeLines.push(...llmResponse.narrative.split('\n').filter(line => line.trim()));
    
    // Determine if we had an age change
    let ageChange = undefined;
    if (isFirstTurn) {
      // For the childhood phase, we want to show ages 9-12 as a range
      ageChange = {
        previousAge: 9,
        newAge: 9, // This triggers [AGE 9-12] display
        narrative: ''
      };
    } else if (newAge !== previousAge) {
      // Regular age change (shouldn't happen in childhood phase)
      ageChange = {
        previousAge,
        newAge,
        narrative: this.generateAgeNarrative(newAge)
      };
    }
    
    return {
      narrativeLines,
      newGameState: updatedGameState,
      transitionInfo: {
        turnType: isFirstTurn ? 'time-skip' : this.determineTurnType(previousAge, newAge),
        yearsProgressed: isFirstTurn ? 4 : newAge - previousAge, // 9-12 is 4 years
        timeSpan: isFirstTurn ? '4 years' : undefined,
        ageChange
      }
    };
  }
  
  private determineTurnType(previousAge: number, newAge: number): 'normal' | 'milestone' | 'sub-turn' | 'time-skip' {
    // Age 12 is a milestone (end of childhood)
    if (newAge === 12) return 'milestone';
    
    // Multiple years passing
    if (newAge - previousAge > 1) return 'time-skip';
    
    return 'normal';
  }
  
  private generateAgeNarrative(age: number): string {
    switch (age) {
      case 9:
        return 'You turn nine, growing more independent with each passing day.';
      case 10:
        return 'Double digits! Ten years old brings new responsibilities and freedoms.';
      case 11:
        return 'At eleven, you stand on the cusp between childhood and adolescence.';
      case 12:
        return 'Twelve years old - the final year of childhood beckons with promise and uncertainty.';
      default:
        return `You are now ${age} years old.`;
    }
  }
}