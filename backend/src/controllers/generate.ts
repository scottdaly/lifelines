import type { Context } from 'hono';
import { generateProceduralBackground, generateParentsFromBackground, applyCorrelatedStats } from '../utils/procedural.js';
import type { Stats } from '../models/types.js';
import { generateInitialGameState } from '../utils/initialState.js';

export async function generateBackground(c: Context) {
  const { birthYear } = await c.req.json();
  
  if (!birthYear || birthYear < 1980 || birthYear > 2025) {
    return c.json({ error: 'Invalid birth year' }, 400);
  }
  
  // Generate procedural background
  const background = generateProceduralBackground(birthYear);
  
  // Create RNG for this generation
  const rng = () => Math.random();
  
  // Generate parents based on background
  const parents = generateParentsFromBackground(background.familyBackground, birthYear, rng);
  
  // Calculate base stats with modifiers
  const baseStats: Stats = {
    intelligence: 10 + Math.floor(Math.random() * 20),
    charisma: 20 + Math.floor(Math.random() * 30),
    strength: 5 + Math.floor(Math.random() * 10),
    creativity: 30 + Math.floor(Math.random() * 20),
    luck: 30 + Math.floor(Math.random() * 40),
    health: 80 + Math.floor(Math.random() * 20),
    wealth: 0 // Will be set based on family
  };
  
  // Apply stat modifiers from background
  Object.entries(background.startingStatModifiers).forEach(([stat, modifier]) => {
    baseStats[stat as keyof Stats] = Math.max(0, Math.min(100, baseStats[stat as keyof Stats] + modifier));
  });
  
  // Apply parent stat correlations
  const parentStats = parents.map(p => p.npc.stats);
  const finalStats = applyCorrelatedStats(baseStats, parentStats, rng);
  
  // Set wealth based on family wealth
  const familyWealth = Math.max(...parents.map(p => p.npc.stats.wealth || 0));
  finalStats.wealth = Math.floor(familyWealth * 0.1);
  
  // Generate complete initial game state
  const character = {
    id: `char_${Date.now()}`,
    name: '', // Will be set by frontend
    gender: '', // Will be set by frontend
    dob: `${birthYear}-01-01`, // Will be updated by frontend
    birthplace: background.birthplace.name,
    stats: finalStats,
    traits: background.traits,
    inventory: {}
  };
  
  const initialGameState = await generateInitialGameState({
    character,
    background,
    relationships: parents,
    birthYear
  });
  
  return c.json({
    background,
    parents,
    suggestedStats: finalStats,
    initialGameState
  });
}