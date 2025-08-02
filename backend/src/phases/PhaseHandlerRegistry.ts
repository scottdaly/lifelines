import type { PhaseHandler } from '../models/gamePhases.js';
import { GamePhase } from '../models/gamePhases.js';
import { EarlyChildhoodPhaseHandler } from './EarlyChildhoodPhaseHandler.js';
import { ChildhoodPhaseHandler } from './ChildhoodPhaseHandler.js';

class PhaseHandlerRegistryClass {
  private handlers: Map<GamePhase, PhaseHandler> = new Map();
  
  constructor() {
    // Register all phase handlers
    this.registerHandler(new EarlyChildhoodPhaseHandler());
    this.registerHandler(new ChildhoodPhaseHandler());
    
    // TODO: Add other phase handlers as they're implemented
    // this.registerHandler(new AdolescencePhaseHandler());
    // etc.
  }
  
  registerHandler(handler: PhaseHandler): void {
    this.handlers.set(handler.phase, handler);
  }
  
  getHandler(phase: GamePhase): PhaseHandler | null {
    return this.handlers.get(phase) || null;
  }
  
  hasHandler(phase: GamePhase): boolean {
    return this.handlers.has(phase);
  }
}

// Export singleton instance
export const PhaseHandlerRegistry = new PhaseHandlerRegistryClass();