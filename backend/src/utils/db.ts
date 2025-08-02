import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../models/schema.js';

export const sqlite = new Database('database.sqlite');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export function initDatabase() {
  // Check if users table needs updating
  const userTableInfo = sqlite.prepare("PRAGMA table_info(users)").all();
  const hasAuthProvider = userTableInfo.some((col: any) => col.name === 'auth_provider');
  const hasGoogleId = userTableInfo.some((col: any) => col.name === 'google_id');
  
  if (!hasAuthProvider || !hasGoogleId) {
    // Disable foreign keys during migration
    sqlite.exec(`PRAGMA foreign_keys = OFF;`);
    
    try {
      // Clean up any existing temp tables
      sqlite.exec(`DROP TABLE IF EXISTS users_new;`);
      
      // Migrate existing users table
      sqlite.exec(`
        CREATE TABLE users_new (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT,
          username TEXT NOT NULL,
          auth_provider TEXT NOT NULL DEFAULT 'local',
          google_id TEXT UNIQUE,
          profile_picture TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      
      // Copy existing data if table exists
      const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      if (tableExists) {
        sqlite.exec(`
          INSERT INTO users_new (id, email, password_hash, username, auth_provider, created_at, updated_at)
          SELECT id, email, password_hash, username, 'local', created_at, updated_at
          FROM users;
        `);
        sqlite.exec(`DROP TABLE users;`);
        sqlite.exec(`ALTER TABLE users_new RENAME TO users;`);
      } else {
        sqlite.exec(`ALTER TABLE users_new RENAME TO users;`);
      }
    } catch (e) {
      console.error('Migration error:', e);
      // If migration fails, ensure we don't leave temp tables
      sqlite.exec(`DROP TABLE IF EXISTS users_new;`);
      throw e;
    } finally {
      // Re-enable foreign keys
      sqlite.exec(`PRAGMA foreign_keys = ON;`);
    }
  } else {
    // Create users table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        username TEXT NOT NULL,
        auth_provider TEXT NOT NULL DEFAULT 'local',
        google_id TEXT UNIQUE,
        profile_picture TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  }
  
  // Create user_sessions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  
  // Drop old game_states table if it exists (to update schema)
  const tableInfo = sqlite.prepare("PRAGMA table_info(game_states)").all();
  const hasUserIdColumn = tableInfo.some((col: any) => col.name === 'user_id');
  const hasCharacterNameColumn = tableInfo.some((col: any) => col.name === 'character_name');
  
  if (!hasUserIdColumn || !hasCharacterNameColumn) {
    // Back up existing data
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS game_states_backup AS 
      SELECT * FROM game_states;
    `);
    
    // Drop old table
    sqlite.exec(`DROP TABLE IF EXISTS game_states;`);
  }
  
  // Create new game_states table with updated schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS game_states (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      game_data TEXT NOT NULL,
      character_name TEXT,
      current_age INTEGER,
      current_stage TEXT,
      last_played INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);
  
  // Create cache table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);
  
  // Create indexes
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
    CREATE INDEX IF NOT EXISTS idx_game_states_is_active ON game_states(is_active);
    CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
  `);
}