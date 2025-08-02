import type { GameState, PlayerChoice, LifeEvent } from '../models/types.js';
import type { TurnResult } from '../models/gamePhases.js';
import { GamePhase } from '../models/gamePhases.js';
import { BasePhaseHandler } from './BasePhaseHandler.js';
import { applyTimeBlockEffects } from '../utils/timeBlocks.js';
import { decodeEarlyLifeChoice } from '../utils/earlyLifeChoices.js';
import { applyStatChanges, applyRelationshipChanges } from '../utils/gameStateUtils.js';
import { processMemory } from '../utils/memoryUtils.js';
import { advanceTime } from '../utils/stageUtils.js';

export class EarlyChildhoodPhaseHandler extends BasePhaseHandler {
  phase = GamePhase.EARLY_CHILDHOOD;
  
  async processTurn(gameState: GameState, playerChoice: PlayerChoice): Promise<TurnResult> {
    // Check if this is the first turn (hobby selection)
    if (!gameState.phaseData?.earlyChildhood?.hobbyChoice) {
      return this.handleHobbySelection(gameState, playerChoice);
    }
    
    // Normal early childhood turn
    return this.handleNormalTurn(gameState, playerChoice);
  }
  
  private async handleHobbySelection(
    gameState: GameState,
    playerChoice: PlayerChoice
  ): Promise<TurnResult> {
    // Decode the hobby choice to get development allocation
    const { allocation } = decodeEarlyLifeChoice(playerChoice.id);
    if (!allocation) {
      throw new Error('Invalid early childhood choice - no allocation found');
    }
    
    // Apply time block effects to character stats
    const { stats, traits } = applyTimeBlockEffects(gameState.character.stats, allocation);
    
    // Update game state with allocation and modified stats
    let updatedGameState: GameState = {
      ...gameState,
      timeBlockAllocations: allocation,
      character: {
        ...gameState.character,
        stats,
        traits: [...gameState.character.traits, ...traits]
      },
      phaseData: {
        ...gameState.phaseData,
        earlyChildhood: {
          ...gameState.phaseData?.earlyChildhood,
          hobbyChoice: playerChoice.id,
          hobbyLabel: playerChoice.label,
          developmentFocus: allocation
        }
      }
    };
    
    // Generate narrative for 8 years of childhood
    const narrativeLines = await this.generateChildhoodNarrative(updatedGameState, playerChoice);
    
    // Create life event for this major period
    const event: LifeEvent = {
      id: `event_${Date.now()}`,
      year: updatedGameState.currentYear,
      title: 'Early Childhood Years',
      description: `Your early years were defined by ${playerChoice.label}. This shaped who you would become.`,
      statChanges: {
        intelligence: allocation.cognitive * 2,
        charisma: allocation.social * 2,
        strength: allocation.physical * 2,
        creativity: allocation.creative * 2,
        health: allocation.physical,
        wealth: 0
      },
      tags: ['childhood', 'development', 'hobby'],
      affectedRelationships: []
    };
    
    // Apply stat changes and add event
    updatedGameState = applyStatChanges(updatedGameState, event.statChanges);
    updatedGameState.events.push(event);
    updatedGameState = processMemory(updatedGameState, event);
    
    // Advance time by 9 years (from age 0 to age 9)
    updatedGameState.currentYear += 9;
    
    // Generate choices for age 9-12 period
    const nextChoices = await this.generateAge9Choices(updatedGameState);
    updatedGameState.pendingChoices = nextChoices;
    
    return {
      narrativeLines,
      newGameState: updatedGameState,
      transitionInfo: {
        turnType: 'time-skip',
        yearsProgressed: 9,
        timeSpan: '9 years'
        // Don't include ageChange - let the childhood phase handle the display
      }
    };
  }
  
  private async handleNormalTurn(
    gameState: GameState,
    playerChoice: PlayerChoice
  ): Promise<TurnResult> {
    // Use base LLM for normal turns
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
    updatedGameState = advanceTime(updatedGameState);
    updatedGameState.pendingChoices = llmResponse.nextChoices;
    
    return {
      narrativeLines: llmResponse.narrative.split('\n').filter(line => line.trim()),
      newGameState: updatedGameState,
      transitionInfo: {
        turnType: 'normal',
        yearsProgressed: 1
      }
    };
  }
  
  private async generateChildhoodNarrative(
    gameState: GameState,
    hobbyChoice: PlayerChoice
  ): Promise<string[]> {
    const { narrativeContext, birthplace, familyBackground } = gameState.proceduralBackground!;
    
    const narrativeLines = [
      '[Early Childhood Years]',
      '',
      `Your earliest years in ${birthplace.name} were shaped by ${(hobbyChoice.label || 'your chosen hobby').toLowerCase()}.`,
      '',
      this.getChildhoodDescription(hobbyChoice, familyBackground.socioeconomicStatus),
      '',
      'As you grew, these early experiences laid the foundation for who you would become.',
      '',
      'Eight years pass in a blur of discovery, growth, and childhood wonder...',
      '',
      'You stand at the threshold of your next phase of childhood.',
      '',
      'The years from 9 to 12 will shape your identity, friendships, and interests.',
      '',
      'What path will you choose for these formative years?'
    ];
    
    return narrativeLines;
  }
  
  private getChildhoodDescription(choice: PlayerChoice, socioStatus: string): string {
    const hobbyDescriptions: Record<string, Record<string, string>> = {
      wealthy: {
        sports: 'Private coaches guided your athletic development at exclusive clubs.',
        books: 'Your family library and private tutors nurtured your love of learning.',
        friends: 'Playdates with children from prominent families filled your social calendar.',
        arts: 'Professional instructors cultivated your creative talents from an early age.'
      },
      middle_class: {
        sports: 'You spent countless hours at local fields and community centers.',
        books: 'The public library became your second home, each book a new adventure.',
        friends: 'The neighborhood kids became your chosen family, inseparable through the years.',
        arts: 'You expressed yourself through any creative medium you could find.'
      },
      working_class: {
        sports: 'You played wherever you could, turning any space into your arena.',
        books: 'You treasured every book you could get your hands on.',
        friends: 'Your tight-knit community provided endless adventures and deep bonds.',
        arts: 'You found beauty and created art with whatever materials were available.'
      },
      poor: {
        sports: 'You found joy in movement despite limited resources.',
        books: 'Each rare book was read and re-read until you knew every word.',
        friends: 'The friends who understood your struggles became everything to you.',
        arts: 'You learned to create beauty from the simplest things.'
      }
    };
    
    // Extract hobby type from choice
    const hobbyType = this.getHobbyType(choice.id);
    const statusDescriptions = hobbyDescriptions[socioStatus] || hobbyDescriptions.middle_class;
    
    return statusDescriptions[hobbyType] || 'Your childhood was filled with exploration and growth.';
  }
  
  private getHobbyType(choiceId: string): string {
    if (choiceId.includes('sports') || choiceId.includes('physical')) return 'sports';
    if (choiceId.includes('books') || choiceId.includes('cognitive')) return 'books';
    if (choiceId.includes('friends') || choiceId.includes('social')) return 'friends';
    if (choiceId.includes('arts') || choiceId.includes('creative')) return 'arts';
    return 'general';
  }
  
  private async generateAge9Choices(gameState: GameState): Promise<any[]> {
    // Generate choices for the 9-12 period
    return [
      {
        id: 'school_eager',
        label: 'Excel academically - throw yourself into schoolwork and learning',
        tags: ['academic', 'eager', 'childhood', 'age9-12']
      },
      {
        id: 'make_friend',
        label: 'Build deep friendships - focus on social connections and relationships',
        tags: ['social', 'friendship', 'childhood', 'age9-12']
      },
      {
        id: 'explore_interest',
        label: 'Develop hobbies - pursue your interests and creative passions',
        tags: ['independent', 'hobby', 'childhood', 'age9-12']
      },
      {
        id: 'help_family',
        label: 'Support your family - take on responsibilities at home',
        tags: ['responsible', 'family', 'childhood', 'age9-12']
      }
    ];
  }
}