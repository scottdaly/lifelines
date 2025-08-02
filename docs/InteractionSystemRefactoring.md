# Lifelines Interaction System Refactoring Plan

## Overview

This document outlines a comprehensive refactoring plan to address the issues identified in the Interaction System Audit. The primary goal is to eliminate the "double display" problem and create a more maintainable, consistent architecture.

## Proposed Architecture

### Core Principles

1. **Single Source of Truth**: Game state flows in one direction
2. **Complete Initial State**: No partial states requiring immediate updates
3. **Explicit State Machine**: Clear game phases and transitions
4. **Modular Special Handlers**: Pluggable system for special game phases

### New Game State Flow

```
1. Character Creation
   └─> Generate COMPLETE initial game state
       └─> Include initial narrative
       └─> Include contextual first choices
       └─> No placeholder choices

2. Game Start
   └─> Load complete state
   └─> Display narrative + choices together
   └─> No immediate server calls needed

3. Turn Processing
   └─> Unified pipeline for all turns
   └─> Special handlers for different phases
   └─> Consistent response format
```

## Implementation Plan

### Phase 1: Create Game Phase System

#### 1.1 Define Game Phases

```typescript
// backend/src/models/gamePhases.ts
export enum GamePhase {
  CHARACTER_CREATION = 'character_creation',
  EARLY_CHILDHOOD = 'early_childhood',  // Ages 0-8
  CHILDHOOD = 'childhood',               // Ages 9-12
  ADOLESCENCE = 'adolescence',           // Ages 13-17
  YOUNG_ADULT = 'young_adult',           // Ages 18-25
  ADULT = 'adult',                       // Ages 26-64
  SENIOR = 'senior'                      // Ages 65+
}

export interface PhaseTransition {
  fromPhase: GamePhase;
  toPhase: GamePhase;
  trigger: 'age' | 'event' | 'choice';
  handler: PhaseTransitionHandler;
}
```

#### 1.2 Update GameState Type

```typescript
// Add to GameState interface
interface GameState {
  // ... existing fields
  currentPhase: GamePhase;
  phaseData?: {
    earlyChildhood?: {
      hobbyChoice?: string;
      developmentFocus?: TimeBlockAllocation;
    };
    // ... other phase-specific data
  };
}
```

### Phase 2: Refactor Initial Game Creation

#### 2.1 New Game Creation Flow

```typescript
// backend/src/controllers/game.ts
export async function createNewGame(params: CreateGameParams): Promise<GameState> {
  const background = await generateBackground(params);
  const character = createCharacter(params, background);
  const relationships = generateRelationships(character, background);
  
  // Generate complete initial state
  const initialState = await generateInitialGameState({
    character,
    background,
    relationships,
    phase: GamePhase.EARLY_CHILDHOOD
  });
  
  // This includes:
  // - Initial narrative (birth story)
  // - Context-appropriate first choices
  // - No placeholders
  
  return initialState;
}
```

#### 2.2 Initial State Generator

```typescript
// backend/src/utils/initialState.ts
export async function generateInitialGameState(params: InitialStateParams): Promise<GameState> {
  // Generate birth narrative
  const birthNarrative = await generateBirthNarrative(params);
  
  // Generate contextual first choices
  const firstChoices = await generateFirstChoices(params);
  
  return {
    // ... base game state
    narrativeHistory: [birthNarrative],
    pendingChoices: firstChoices,
    currentPhase: GamePhase.EARLY_CHILDHOOD,
    // No need for 'early_life_start' - choices are already contextual
  };
}
```

### Phase 3: Unify Turn Processing

#### 3.1 New Turn Pipeline

```typescript
// backend/src/controllers/turn.ts
export async function processTurn(
  gameState: GameState,
  playerChoice: PlayerChoice
): Promise<TurnResult> {
  // 1. Identify current phase
  const phase = gameState.currentPhase;
  
  // 2. Get phase handler
  const handler = getPhaseHandler(phase);
  
  // 3. Process turn through handler
  const result = await handler.processTurn(gameState, playerChoice);
  
  // 4. Check for phase transitions
  const newPhase = checkPhaseTransition(result.newGameState);
  if (newPhase !== phase) {
    result.newGameState.currentPhase = newPhase;
    result.phaseTransition = {
      from: phase,
      to: newPhase
    };
  }
  
  return result;
}
```

#### 3.2 Phase Handlers

```typescript
// backend/src/phases/earlyChildhood.ts
export class EarlyChildhoodPhaseHandler implements PhaseHandler {
  async processTurn(
    gameState: GameState,
    playerChoice: PlayerChoice
  ): Promise<TurnResult> {
    // Handle hobby selection on first turn
    if (!gameState.phaseData?.earlyChildhood?.hobbyChoice) {
      return this.handleHobbySelection(gameState, playerChoice);
    }
    
    // Normal early childhood turns
    return this.handleNormalTurn(gameState, playerChoice);
  }
  
  private async handleHobbySelection(
    gameState: GameState,
    playerChoice: PlayerChoice
  ): Promise<TurnResult> {
    // Decode choice to get development allocation
    const allocation = decodeHobbyChoice(playerChoice.id);
    
    // Apply effects
    const updatedState = applyEarlyDevelopment(gameState, allocation);
    
    // Generate narrative for 8 years of childhood
    const narrative = await generateChildhoodNarrative(updatedState, playerChoice);
    
    // Advance to age 8
    updatedState.currentYear += 8;
    
    // Generate age 8 choices
    const nextChoices = await generateAge8Choices(updatedState);
    
    return {
      narrativeLines: narrative,
      newGameState: updatedState,
      transitionInfo: {
        yearsProgressed: 8,
        ageChange: { from: 0, to: 8 }
      }
    };
  }
}
```

### Phase 4: Frontend Refactoring

#### 4.1 Update Game Store

```typescript
// frontend/src/store/gameStore.ts
interface GameStore {
  gameState: GameState | null;
  gamePhase: GamePhase | null;
  isInitializing: boolean;
  isProcessingTurn: boolean;
  
  // Remove immediate display of incomplete choices
  initializeGame: (gameState: GameState) => void;
  processTurn: (choice: PlayerChoice) => Promise<void>;
}

// New initialization doesn't need to add narrative
initializeGame: (gameState) => {
  set({ 
    gameState,
    gamePhase: gameState.currentPhase,
    // narrativeHistory is already complete from backend
    isInitializing: false
  });
}
```

#### 4.2 Update Choice Display

```typescript
// frontend/src/components/ChoiceList.tsx
export function ChoiceList() {
  const { gameState, isProcessingTurn, gamePhase } = useGameStore();
  
  // Don't show choices until game is fully initialized
  if (!gameState || !gamePhase) {
    return <LoadingState />;
  }
  
  // Choices now always have proper context
  const choices = gameState.pendingChoices;
  
  return (
    <ChoiceContainer>
      {/* Contextual prompt based on phase */}
      <ChoicePrompt phase={gamePhase} />
      
      {choices.map((choice) => (
        <Choice key={choice.id} choice={choice} />
      ))}
    </ChoiceContainer>
  );
}
```

### Phase 5: Migration Strategy

#### 5.1 Database Migration

```sql
-- Add new fields to game_states table
ALTER TABLE game_states ADD COLUMN current_phase VARCHAR(50);
ALTER TABLE game_states ADD COLUMN phase_data JSON;

-- Update existing games
UPDATE game_states 
SET current_phase = CASE
  WHEN current_age <= 8 THEN 'early_childhood'
  WHEN current_age <= 12 THEN 'childhood'
  -- etc.
END;
```

#### 5.2 Backward Compatibility

```typescript
// backend/src/utils/gameState.ts
export async function loadGame(id: string): Promise<GameState> {
  const rawState = await loadFromDB(id);
  
  // Migrate old format
  if (!rawState.currentPhase) {
    rawState.currentPhase = determinePhaseFromAge(rawState);
  }
  
  // Handle old early_life_start choices
  if (rawState.pendingChoices?.[0]?.id === 'early_life_start') {
    // Generate proper initial state
    const phase = getPhaseHandler(GamePhase.EARLY_CHILDHOOD);
    const initialChoices = await phase.generateInitialChoices(rawState);
    rawState.pendingChoices = initialChoices;
  }
  
  return rawState;
}
```

## Benefits

1. **Eliminates Double Display**: Choices always have context
2. **Cleaner Architecture**: Clear separation of concerns
3. **Maintainability**: Easy to add new phases or special handling
4. **Better UX**: Consistent, predictable behavior
5. **Testability**: Each phase handler can be tested independently

## Implementation Timeline

- **Week 1**: Implement Phase system and handlers
- **Week 2**: Refactor game creation and initialization
- **Week 3**: Update frontend components
- **Week 4**: Migration and testing

## Breaking Changes

1. **Game State Structure**: New fields added
2. **Initial Creation Flow**: Different API response
3. **Save Format**: Phase data needs migration

## Risk Mitigation

1. **Feature Flag**: Roll out behind feature flag
2. **Dual Support**: Support both old and new formats during transition
3. **Automated Migration**: Script to update existing games
4. **Extensive Testing**: Each phase handler thoroughly tested

## Success Metrics

1. **No Double Display**: Choices appear once with context
2. **Faster Initial Load**: No immediate server call needed
3. **Code Reduction**: Less special case handling
4. **Improved Testability**: Higher test coverage possible

## Next Steps

1. Review and approve this plan
2. Create detailed technical specifications
3. Set up feature branch and flags
4. Begin Phase 1 implementation

This refactoring will significantly improve code quality and user experience while setting up a solid foundation for future game mechanics.