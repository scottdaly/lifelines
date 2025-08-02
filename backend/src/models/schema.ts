import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// User authentication tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for OAuth users
  username: text('username').notNull(),
  authProvider: text('auth_provider').notNull().default('local'), // 'local' | 'google'
  googleId: text('google_id').unique(), // Unique Google identifier
  profilePicture: text('profile_picture'), // Optional profile picture URL
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Game state table - updated with user association
export const gameStates = sqliteTable('game_states', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  gameData: text('game_data').notNull(),
  characterName: text('character_name'),
  currentAge: integer('current_age'),
  currentStage: text('current_stage'),
  currentPhase: text('current_phase'), // New field for phase system
  phaseData: text('phase_data'), // New field for phase-specific data (JSON)
  lastPlayed: integer('last_played', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

export const cache = sqliteTable('cache', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});