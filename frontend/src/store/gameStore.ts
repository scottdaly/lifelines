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
    // If the game state includes narrativeHistory (new complete initial state), use it
    const narrativeLines = gameState.narrativeHistory ? [...gameState.narrativeHistory] : [];
    
    // Only add legacy narrative if no narrativeHistory exists
    if (!gameState.narrativeHistory) {
      const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
      if (age > 0) {
        narrativeLines.push('Welcome back. Your story continues...');
      }
      
      // Add procedural background narrative if available and we're at age 0
      if (gameState.proceduralBackground && age === 0) {
        const { narrativeContext, birthplace, era } = gameState.proceduralBackground;
        narrativeLines.push(`[Born in ${birthplace.name}, ${era.name}]`);
        narrativeLines.push(narrativeContext.familyStory);
        narrativeLines.push(narrativeContext.environmentDescription);
        narrativeLines.push('');
        narrativeLines.push(`Your traits: ${gameState.character.traits.join(', ')}`);
      }
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to process turn' }));
        throw new Error(errorData.error || 'Failed to process turn');
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
        // Show age range for early stages
        const newAge = turnResponse.transitionInfo.ageChange.newAge;
        if (newAge >= 0 && newAge <= 8) {
          transitionLines.push(`[AGE 0-8]`);
        } else if (newAge >= 9 && newAge <= 12) {
          transitionLines.push(`[AGE 9-12]`);
        } else {
          transitionLines.push(`[AGE ${newAge}]`);
        }
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Add error to narrative for immediate visibility
      set(state => ({ 
        error: errorMessage,
        isLoading: false,
        narrativeLines: [
          ...state.narrativeLines,
          '',
          `[ERROR] ${errorMessage}`,
          'Please try again or choose a different action.'
        ]
      }));
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