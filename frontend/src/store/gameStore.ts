import { create } from 'zustand';
import type { GameState, PlayerChoice, TurnResponse } from '../types';
import { useAuthStore } from './authStore';

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
      const { narrativeContext, birthplace, era } = gameState.proceduralBackground;
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
    
    // Get the current game ID from the URL
    const pathParts = window.location.pathname.split('/');
    const gameId = pathParts[pathParts.length - 1];
    
    if (!gameId) {
      set({ error: 'No game ID found' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const { tokens } = useAuthStore.getState();
      const response = await fetch(`${API_BASE}/api/games/${gameId}/turn`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
        body: JSON.stringify({ playerChoice: choice })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process turn');
      }
      
      const turnResponse: TurnResponse = await response.json();
      
      // Build transition narrative lines
      const transitionLines: string[] = [];
      
      // Add turn type indicator
      if (turnResponse.transitionInfo.turnType === 'milestone') {
        transitionLines.push('');
        transitionLines.push('[MILESTONE AGE]');
      } else if (turnResponse.transitionInfo.turnType === 'sub-turn') {
        transitionLines.push('');
        transitionLines.push(`[${turnResponse.transitionInfo.timeSpan?.toUpperCase() || 'SUB-TURN'}]`);
      } else if (turnResponse.transitionInfo.turnType === 'time-skip' && turnResponse.transitionInfo.timeSpan) {
        transitionLines.push('');
        transitionLines.push(`[${turnResponse.transitionInfo.timeSpan.toUpperCase()} PASS]`);
      }
      
      if (turnResponse.transitionInfo.ageChange) {
        if (turnResponse.transitionInfo.turnType !== 'milestone') {
          transitionLines.push('');
        }
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
  
  clearError: () => set({ error: null }),
  
  addNarrativeLine: (line) => {
    set(state => ({
      narrativeLines: [...state.narrativeLines, line]
    }));
  },
  
  setTyping: (isTyping) => set({ isTyping })
}));