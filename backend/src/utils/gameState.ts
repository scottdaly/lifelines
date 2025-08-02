import { db } from './db.js';
import { gameStates } from '../models/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { GameState } from '../models/types.js';

export async function createGame(userId: string, gameState: GameState): Promise<string> {
  const id = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date();
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  await db.insert(gameStates).values({
    id,
    userId,
    gameData: JSON.stringify(gameState),
    characterName: gameState.character.name,
    currentAge: age,
    currentStage: getCurrentStage(age),
    currentPhase: gameState.currentPhase,
    phaseData: gameState.phaseData ? JSON.stringify(gameState.phaseData) : null,
    lastPlayed: now,
    createdAt: now,
    updatedAt: now,
    isActive: true
  });
  
  return id;
}

export async function saveGame(gameState: GameState): Promise<string> {
  // Legacy function for backward compatibility
  const id = `game_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = new Date();
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  await db.insert(gameStates).values({
    id,
    userId: 'anonymous',
    gameData: JSON.stringify(gameState),
    characterName: gameState.character.name,
    currentAge: age,
    currentStage: getCurrentStage(age),
    lastPlayed: now,
    createdAt: now,
    updatedAt: now,
    isActive: true
  });
  
  return id;
}

export async function loadGame(id: string, userId?: string): Promise<GameState | null> {
  const conditions = userId
    ? and(eq(gameStates.id, id), eq(gameStates.userId, userId))
    : eq(gameStates.id, id);
  
  const results = await db
    .select()
    .from(gameStates)
    .where(conditions)
    .limit(1);
  
  if (results.length === 0) {
    return null;
  }
  
  const gameState = JSON.parse(results[0].gameData) as GameState;
  
  // Add default values for new fields if missing (backward compatibility)
  if (gameState.narrativePressure === undefined) {
    gameState.narrativePressure = 0;
  }
  if (gameState.lastMilestoneAge === undefined) {
    gameState.lastMilestoneAge = 0;
  }
  if (gameState.currentSubTurn === undefined) {
    gameState.currentSubTurn = undefined;
  }
  
  return gameState;
}

export async function checkGameOwnership(gameId: string, userId: string): Promise<boolean> {
  const results = await db
    .select({ id: gameStates.id })
    .from(gameStates)
    .where(and(
      eq(gameStates.id, gameId),
      eq(gameStates.userId, userId)
    ))
    .limit(1);
  
  return results.length > 0;
}

export async function updateGame(id: string, gameState: GameState, userId?: string): Promise<void> {
  const now = new Date();
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  const updateData: any = {
    gameData: JSON.stringify(gameState),
    currentAge: age,
    currentStage: getCurrentStage(age),
    currentPhase: gameState.currentPhase,
    phaseData: gameState.phaseData ? JSON.stringify(gameState.phaseData) : null,
    lastPlayed: now,
    updatedAt: now
  };
  
  // Only update if user owns the game
  const conditions = userId 
    ? and(eq(gameStates.id, id), eq(gameStates.userId, userId))
    : eq(gameStates.id, id);
  
  await db
    .update(gameStates)
    .set(updateData)
    .where(conditions);
}

export async function getUserGames(userId: string): Promise<Array<{
  id: string;
  characterName: string | null;
  currentAge: number | null;
  currentStage: string | null;
  lastPlayed: Date;
  createdAt: Date;
}>> {
  const games = await db
    .select({
      id: gameStates.id,
      characterName: gameStates.characterName,
      currentAge: gameStates.currentAge,
      currentStage: gameStates.currentStage,
      lastPlayed: gameStates.lastPlayed,
      createdAt: gameStates.createdAt
    })
    .from(gameStates)
    .where(and(
      eq(gameStates.userId, userId),
      eq(gameStates.isActive, true)
    ))
    .orderBy(desc(gameStates.lastPlayed));
  
  return games;
}

export async function deleteGame(id: string, userId: string): Promise<void> {
  // Soft delete - just mark as inactive
  await db
    .update(gameStates)
    .set({
      isActive: false,
      updatedAt: new Date()
    })
    .where(and(
      eq(gameStates.id, id),
      eq(gameStates.userId, userId)
    ));
}

function getCurrentStage(age: number): string {
  if (age < 9) return 'earlyLife';
  if (age < 13) return 'tween';
  if (age < 18) return 'highSchool';
  if (age < 25) return 'youngAdult';
  if (age < 65) return 'adult';
  return 'senior';
}