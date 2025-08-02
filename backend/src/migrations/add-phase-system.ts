import { db } from '../utils/db.js';
import { gameStates } from '../models/schema.js';
import { GamePhase, getPhaseForAge } from '../models/gamePhases.js';
import { sql } from 'drizzle-orm';

export async function addPhaseSystemMigration() {
  console.log('Starting phase system migration...');
  
  try {
    // Try to add columns - will fail silently if they already exist
    try {
      await db.run(sql`
        ALTER TABLE game_states 
        ADD COLUMN current_phase TEXT
      `);
      console.log('Added current_phase column');
    } catch (e: any) {
      if (!e.message.includes('duplicate column')) {
        throw e;
      }
      console.log('current_phase column already exists');
    }
    
    try {
      await db.run(sql`
        ALTER TABLE game_states 
        ADD COLUMN phase_data TEXT
      `);
      console.log('Added phase_data column');
    } catch (e: any) {
      if (!e.message.includes('duplicate column')) {
        throw e;
      }
      console.log('phase_data column already exists');
    }
    
    console.log('Phase columns ready in game_states table');
    
    // Update existing games with phase data
    const games = await db.select().from(gameStates);
    
    for (const game of games) {
      const gameData = JSON.parse(game.gameData);
      const age = gameData.currentYear - parseInt(gameData.character.dob.split('-')[0]);
      const phase = getPhaseForAge(age);
      
      // Update the game with phase information
      await db.update(gameStates)
        .set({
          currentPhase: phase,
          phaseData: JSON.stringify({})
        })
        .where(sql`id = ${game.id}`);
    }
    
    console.log(`Updated ${games.length} games with phase data`);
    console.log('Phase system migration completed successfully');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addPhaseSystemMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}