import { create } from 'zustand';
import type { GameState, Choice, PlayerChoice, TurnResponse } from '../types';

interface GameStore {
  // Game State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  
  // UI State
  narrativeLines: string[];
  isTyping: boolean;
  
  // Actions
  initializeGame: (gameState: GameState) => void;
  processTurn: (choice: PlayerChoice) => Promise<void>;
  loadGame: (saveId: string) => Promise<void>;
  saveGame: () => Promise<string | null>;
  clearError: () => void;
  addNarrativeLine: (line: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: null,
  isLoading: false,
  error: null,
  narrativeLines: [],
  isTyping: false,
  
  // Actions
  initializeGame: (gameState) => {
    const narrativeLines = ['Welcome to the world. Your story begins...'];
    
    // Add procedural background narrative if available
    if (gameState.proceduralBackground) {
      const { narrativeContext, birthplace, familyBackground, era } = gameState.proceduralBackground;
      narrativeLines.push('');
      narrativeLines.push(`[Born in ${birthplace.name}, ${era.name}]`);
      narrativeLines.push(narrativeContext.familyStory);
      narrativeLines.push(narrativeContext.environmentDescription);
      narrativeLines.push('');
      narrativeLines.push(`Your traits: ${gameState.character.traits.join(', ')}`);
      narrativeLines.push('');
    }
    
    set({ 
      gameState, 
      error: null,
      narrativeLines
    });
  },
  
  processTurn: async (choice) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE}/api/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState, playerChoice: choice })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process turn');
      }
      
      const turnResponse: TurnResponse = await response.json();
      
      // Build transition narrative lines
      const transitionLines: string[] = [];
      
      if (turnResponse.transitionInfo.ageChange) {
        transitionLines.push('');
        transitionLines.push(`[AGE ${turnResponse.transitionInfo.ageChange.newAge}]`);
        transitionLines.push(turnResponse.transitionInfo.ageChange.narrative);
        transitionLines.push('');
      }
      
      // Update game state with transition lines followed by narrative
      set({ 
        gameState: turnResponse.newGameState,
        narrativeLines: [
          ...get().narrativeLines, 
          ...transitionLines,
          ...turnResponse.narrativeLines
        ],
        isLoading: false
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      });
    }
  },
  
  loadGame: async (saveId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE}/api/load/${saveId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load game');
      }
      
      const { gameState } = await response.json();
      set({ 
        gameState,
        isLoading: false,
        narrativeLines: ['Game loaded. Your story continues...']
      });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load game',
        isLoading: false 
      });
    }
  },
  
  saveGame: async () => {
    const { gameState } = get();
    if (!gameState) return null;
    
    try {
      const response = await fetch(`${API_BASE}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save game');
      }
      
      const { saveId } = await response.json();
      return saveId;
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save game' 
      });
      return null;
    }
  },
  
  clearError: () => set({ error: null }),
  
  addNarrativeLine: (line) => {
    set(state => ({
      narrativeLines: [...state.narrativeLines, line]
    }));
  },
  
  setTyping: (isTyping) => set({ isTyping })
}));