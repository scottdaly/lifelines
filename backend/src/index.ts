import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { config } from 'dotenv';
import { handleTurn } from './controllers/turn.js';
import { generateBackground } from './controllers/generate.js';
import { loadGame, saveGame, createGame, updateGame, getUserGames, deleteGame } from './utils/gameState.js';
import { initDatabase, sqlite } from './utils/db.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { register, login, logout, refresh, getMe, googleLogin } from './controllers/auth.js';
import { startCleanupSchedule, stopCleanupSchedule } from './utils/cleanup.js';
import type { GameState, PlayerChoice } from './models/types.js';

config();
initDatabase();
startCleanupSchedule();

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: [
    'https://lifelines.rsdaly.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/google', googleLogin);
app.post('/api/auth/logout', logout);
app.post('/api/auth/refresh', refresh);
app.get('/api/auth/me', authMiddleware, getMe);

// Test endpoint for OpenAI connectivity
app.get('/api/test-openai', async (c) => {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('[TEST] Testing OpenAI connectivity...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: 'You are a test assistant. Reply with a simple JSON object.' },
        { role: 'user', content: 'Please respond with: {"status": "working", "message": "OpenAI connection successful"}' }
      ],
      max_tokens: 100,
      temperature: 0
    });
    
    const response = completion.choices[0]?.message?.content;
    console.log('[TEST] OpenAI response:', response);
    
    return c.json({
      status: 'success',
      model: 'gpt-4.1',
      response: response,
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    console.error('[TEST] OpenAI test failed:', error);
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyConfigured: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0
    }, 500);
  }
});

const turnSchema = z.object({
  playerChoice: z.object({
    id: z.string(),
    label: z.string().optional(),
    isCustom: z.boolean().optional()
  })
});

app.post('/api/games/:id/turn', authMiddleware, zValidator('json', turnSchema), async (c) => {
  try {
    const userId = c.get('userId')!;
    const gameId = c.req.param('id');
    const { playerChoice } = c.req.valid('json');
    
    // Load the current game state
    const gameState = await loadGame(gameId, userId);
    if (!gameState) {
      return c.json({ error: 'Game not found' }, 404);
    }
    
    // Process the turn
    const result = await handleTurn(gameState, playerChoice, gameId, userId);
    
    // Autosave the new game state
    await updateGame(gameId, result.newGameState, userId);
    
    return c.json(result);
  } catch (error) {
    console.error('Turn error:', error);
    return c.json({ error: 'Failed to process turn' }, 500);
  }
});

app.get('/api/load/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const gameState = await loadGame(id);
    if (!gameState) {
      return c.json({ error: 'Game not found' }, 404);
    }
    return c.json({ gameState });
  } catch (error) {
    console.error('Load error:', error);
    return c.json({ error: 'Failed to load game' }, 500);
  }
});

const saveSchema = z.object({
  gameState: z.any()
});

app.post('/api/save', zValidator('json', saveSchema), async (c) => {
  try {
    const { gameState } = c.req.valid('json');
    const saveId = await saveGame(gameState as GameState);
    return c.json({ saveId });
  } catch (error) {
    console.error('Save error:', error);
    return c.json({ error: 'Failed to save game' }, 500);
  }
});

const generateSchema = z.object({
  birthYear: z.number().min(1980).max(2025)
});

app.post('/api/generate-background', authMiddleware, zValidator('json', generateSchema), async (c) => {
  try {
    const { birthYear } = c.req.valid('json');
    const result = await generateBackground(c);
    return result;
  } catch (error) {
    console.error('Generate error:', error);
    return c.json({ error: 'Failed to generate background' }, 500);
  }
});

// Protected game routes - require authentication
app.get('/api/games', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')!;
    const games = await getUserGames(userId);
    return c.json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    return c.json({ error: 'Failed to get games' }, 500);
  }
});

app.get('/api/games/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')!;
    const gameId = c.req.param('id');
    const gameState = await loadGame(gameId, userId);
    
    if (!gameState) {
      return c.json({ error: 'Game not found' }, 404);
    }
    
    return c.json({ gameState, gameId });
  } catch (error) {
    console.error('Load game error:', error);
    return c.json({ error: 'Failed to load game' }, 500);
  }
});

const createGameSchema = z.object({
  gameState: z.any()
});

app.post('/api/games', authMiddleware, zValidator('json', createGameSchema), async (c) => {
  try {
    const userId = c.get('userId')!;
    const { gameState } = c.req.valid('json');
    const gameId = await createGame(userId, gameState as GameState);
    return c.json({ gameId });
  } catch (error) {
    console.error('Create game error:', error);
    return c.json({ error: 'Failed to create game' }, 500);
  }
});

const updateGameSchema = z.object({
  gameState: z.any()
});

app.put('/api/games/:id', authMiddleware, zValidator('json', updateGameSchema), async (c) => {
  try {
    const userId = c.get('userId')!;
    const gameId = c.req.param('id');
    const { gameState } = c.req.valid('json');
    
    await updateGame(gameId, gameState as GameState, userId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Update game error:', error);
    return c.json({ error: 'Failed to update game' }, 500);
  }
});

app.delete('/api/games/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')!;
    const gameId = c.req.param('id');
    
    await deleteGame(gameId, userId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete game error:', error);
    return c.json({ error: 'Failed to delete game' }, 500);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = serve({
  fetch: app.fetch,
  port
});

console.log(`Server running on http://localhost:${port}`);

// Graceful shutdown handling
const shutdown = () => {
  console.log('\nShutting down server...');
  
  // Stop cleanup schedule
  stopCleanupSchedule();
  console.log('Cleanup schedule stopped');
  
  // Close the SQLite database connection
  try {
    sqlite.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
  
  // Exit the process
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGHUP', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});