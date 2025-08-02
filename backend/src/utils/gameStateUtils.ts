import type { GameState, Stats, RelStats } from '../models/types.js';

const STAT_MIN = 0;
const STAT_MAX = 100;

function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}

export function applyStatChanges(
  gameState: GameState,
  statChanges: Partial<Stats>
): GameState {
  const updatedState = { ...gameState };
  const currentStats = { ...updatedState.character.stats };
  
  for (const [stat, delta] of Object.entries(statChanges)) {
    if (delta !== undefined && stat in currentStats) {
      currentStats[stat as keyof Stats] = clampStat(
        currentStats[stat as keyof Stats] + delta
      );
    }
  }
  
  updatedState.character.stats = currentStats;
  return updatedState;
}

export function applyRelationshipChanges(
  gameState: GameState,
  affectedRelationships: Array<{
    npcId: string;
    relStatDeltas: Partial<RelStats>;
    narrativeImpact: string;
  }>
): GameState {
  const updatedState = { ...gameState };
  
  for (const change of affectedRelationships) {
    const relIndex = updatedState.relationships.findIndex(
      rel => rel.npc.id === change.npcId
    );
    
    if (relIndex === -1) continue;
    
    const relationship = { ...updatedState.relationships[relIndex] };
    const relStats = { ...relationship.relStats };
    
    for (const [stat, delta] of Object.entries(change.relStatDeltas)) {
      if (delta !== undefined && stat in relStats) {
        relStats[stat as keyof RelStats] = clampStat(
          relStats[stat as keyof RelStats] + delta
        );
      }
    }
    
    relationship.relStats = relStats;
    
    if (relStats.intimacy < 20 || relStats.conflict > 80) {
      relationship.status = 'estranged';
    }
    
    updatedState.relationships[relIndex] = relationship;
  }
  
  return updatedState;
}