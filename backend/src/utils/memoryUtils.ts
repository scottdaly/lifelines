import type { GameState, LifeEvent } from '../models/types.js';
import { MemoryProcessor } from './memoryProcessor.js';
import { ThemeDetector } from './themeDetector.js';

const memoryProcessor = new MemoryProcessor();
const themeDetector = new ThemeDetector();

export function processMemory(gameState: GameState, newEvent: LifeEvent): GameState {
  const updatedState = { ...gameState };
  
  if (!updatedState.memorySystem) {
    updatedState.memorySystem = {
      memories: {},
      themes: {},
      coreMemoryIds: []
    };
  }
  
  // Evaluate the new memory
  const newMemory = memoryProcessor.evaluateEvent(newEvent, updatedState);
  
  // Store the memory
  updatedState.memorySystem.memories[newMemory.id] = newMemory;
  
  // Add to core memories if it's a core memory
  if (newMemory.type === 'core' && !updatedState.memorySystem.coreMemoryIds.includes(newMemory.id)) {
    updatedState.memorySystem.coreMemoryIds.push(newMemory.id);
    // Keep only the most recent 10 core memories
    if (updatedState.memorySystem.coreMemoryIds.length > 10) {
      updatedState.memorySystem.coreMemoryIds.shift();
    }
  }
  
  // Detect themes
  themeDetector.detectThemes(updatedState.memorySystem, newEvent, updatedState);
  
  // Process memory decay
  memoryProcessor.processMemoryDecay(updatedState.memorySystem, updatedState.currentYear);
  
  return updatedState;
}