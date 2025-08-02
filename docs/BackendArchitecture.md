# Backend Architecture Documentation

## Overview

The Lifelines backend is a modern Node.js application built with TypeScript that serves as the API and game engine for a text-based life simulation game. It uses the Hono web framework, SQLite database with Drizzle ORM, and OpenAI's GPT-4 for narrative generation.

## Technology Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Web Framework**: [Hono](https://hono.dev/) - A lightweight, high-performance web framework
- **Database**: SQLite with Better-SQLite3 driver
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL query builder
- **AI Integration**: OpenAI GPT-4.1 for narrative generation
- **Authentication**: JWT tokens with refresh token pattern

### Key Dependencies
```json
{
  "hono": "^4.6.5",
  "@hono/node-server": "^1.13.3",
  "drizzle-orm": "^0.37.0",
  "better-sqlite3": "^11.6.0",
  "openai": "^4.76.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "google-auth-library": "^9.16.2",
  "zod": "^3.24.1"
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── controllers/          # API endpoint handlers
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── generate.ts      # Background generation
│   │   └── turn.ts          # Game turn processing
│   ├── models/              # Database models and types
│   │   ├── schema.ts        # Drizzle schema definitions
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── auth.ts          # Authentication models
│   │   ├── memory.ts        # Memory system types
│   │   └── procedural.ts    # Procedural generation types
│   ├── data/                # Static game data
│   │   ├── birthplaces.ts   # Location data
│   │   ├── eras.ts          # Historical periods
│   │   ├── professions.ts   # Career options
│   │   └── traits.ts        # Character traits
│   ├── utils/               # Utility functions
│   │   ├── db.ts            # Database connection
│   │   ├── auth.ts          # Auth utilities
│   │   ├── llm.ts           # OpenAI integration
│   │   ├── gameState.ts     # Game state management
│   │   ├── dynamicTurns.ts  # Turn progression logic
│   │   ├── memoryProcessor.ts # Memory system
│   │   └── procedural.ts    # Content generation
│   └── middleware/          # Express middleware
│       └── auth.ts          # Authentication middleware
├── database.sqlite          # SQLite database file
├── drizzle.config.ts       # Drizzle ORM configuration
└── package.json
```

## Server Configuration

### Main Server (index.ts)
```typescript
const app = new Hono()
  .use(logger())
  .use(cors({ origin: FRONTEND_URL, credentials: true }))
  .use('/api/*', timeout(600000)) // 10-minute timeout for LLM calls
```

The server runs on port 3000 by default (configurable via PORT environment variable).

## API Architecture

### Authentication Endpoints

| Endpoint | Method | Description | Protected |
|----------|--------|-------------|-----------|
| `/api/auth/register` | POST | Create new user account | No |
| `/api/auth/login` | POST | Login with email/password | No |
| `/api/auth/google` | POST | Google OAuth login | No |
| `/api/auth/logout` | POST | Logout user | Yes |
| `/api/auth/refresh` | POST | Refresh access token | No |
| `/api/auth/me` | GET | Get current user info | Yes |

### Game Management Endpoints

| Endpoint | Method | Description | Protected |
|----------|--------|-------------|-----------|
| `/api/games` | GET | List user's games | Yes |
| `/api/games/:id` | GET | Get specific game | Yes |
| `/api/games` | POST | Create new game | Yes |
| `/api/games/:id` | PUT | Update game state | Yes |
| `/api/games/:id` | DELETE | Delete game | Yes |

### Gameplay Endpoints

| Endpoint | Method | Description | Protected |
|----------|--------|-------------|-----------|
| `/api/games/:id/turn` | POST | Process game turn | Yes |
| `/api/generate-background` | POST | Generate character background | Yes |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT UNIQUE,
  display_name TEXT,
  profile_picture TEXT,
  auth_provider TEXT NOT NULL, -- 'local' or 'google'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

### Game States Table
```sql
CREATE TABLE game_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  state TEXT NOT NULL, -- JSON game state
  character_name TEXT,
  character_age INTEGER,
  character_stage TEXT,
  last_played_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## Authentication System

### JWT Token Strategy
- **Access Token**: 15-minute expiry, contains user ID
- **Refresh Token**: 7-day expiry, stored in database
- **Token Rotation**: New refresh token issued on refresh

### Password Security
- Bcrypt hashing with 10 salt rounds
- Minimum 8 characters required
- Email validation enforced

### OAuth Integration
- Google OAuth2 support
- Automatic account creation for new OAuth users
- Links OAuth accounts to existing users by email

## Game Engine Architecture

### Turn Processing Flow

1. **Request Validation**: Validate game ID and choice
2. **State Loading**: Load current game state from database
3. **Context Building**: Gather relevant memories, relationships, and history
4. **AI Generation**: Send context to GPT-4 for narrative generation
5. **State Updates**: Apply stat changes, relationship updates, memory storage
6. **Time Advancement**: Calculate next turn's time progression
7. **Choice Generation**: Create choices for next turn
8. **State Persistence**: Save updated state to database

### Dynamic Turn System

The game uses sophisticated time progression based on life stage:

```typescript
function calculateNextTurnLength(age: number, stage: LifeStage) {
  switch (stage) {
    case 'high_school':
      return { baseLength: 0.25, variance: 0, unit: 'seasonal' }
    case 'young_adult':
      return { baseLength: 2, variance: 1 }
    case 'adult':
      return { baseLength: 3, variance: 2 }
    // ...
  }
}
```

### Memory System

#### Memory Hierarchy
1. **Core Memories** (7-10 max): Most formative experiences
2. **Significant Memories**: Important but not defining
3. **Ordinary Memories**: Day-to-day experiences

#### Memory Processing Pipeline
1. **Event Capture**: Extract memory from turn event
2. **Valence Analysis**: Determine emotional impact (-1 to 1)
3. **Association Finding**: Link to existing memories
4. **Theme Detection**: Identify recurring patterns
5. **Decay Management**: Remove old, insignificant memories

#### Theme System
Tracks emergent patterns in player's life:
- Academic excellence
- Family conflict
- Artistic expression
- Rebellious spirit
- Social butterfly

## AI Integration

### OpenAI Configuration
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
  maxRetries: 2
});
```

### Prompt Engineering
The system uses structured prompts with:
- Character context (stats, traits, age)
- Recent history (last 5-10 turns)
- Relevant memories
- Active relationships
- Current life stage considerations

### Response Processing
1. Parse AI response as structured JSON
2. Validate stat changes are reasonable
3. Extract narrative text
4. Generate appropriate consequences
5. Create contextual choices

## Performance Optimizations

### Database Optimizations
- Prepared statements for common queries
- Indexes on user_id and game_id columns
- JSON column for flexible game state storage
- Connection pooling with better-sqlite3

### Caching Strategy
- Simple key-value cache table for temporary data
- 15-minute expiry for generated content
- Memory-based caching for static data (eras, traits)

### Error Handling
- Graceful degradation for AI failures
- Comprehensive error logging
- User-friendly error messages
- Automatic cleanup of expired sessions

## Security Measures

### Input Validation
- Zod schemas for all API inputs
- SQL injection protection via parameterized queries
- XSS prevention in generated content
- Rate limiting considerations

### Environment Variables
```bash
PORT=3000
DATABASE_URL=./database.sqlite
OPENAI_API_KEY=sk-...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

## Deployment Considerations

### Production Setup
1. Use environment variables for all secrets
2. Enable HTTPS for all endpoints
3. Implement rate limiting
4. Set up database backups
5. Monitor OpenAI API usage
6. Configure proper CORS settings

### Scaling Considerations
- Stateless design allows horizontal scaling
- Database may need migration to PostgreSQL for large scale
- Consider Redis for session storage at scale
- Implement request queuing for AI calls

## Development Workflow

### Local Development
```bash
npm run dev  # Start with hot reload
npm run build  # Compile TypeScript
npm start  # Run production build
```

### Database Migrations
```bash
npm run db:generate  # Generate migration from schema
npm run db:migrate  # Apply migrations
npm run db:studio  # Open Drizzle Studio
```

## Future Enhancements

### Planned Features
1. WebSocket support for real-time updates
2. Multiplayer/family tree connections
3. Achievement system
4. Cloud save sync
5. Mobile app API support

### Technical Debt
1. Add comprehensive test coverage
2. Implement API versioning
3. Enhanced monitoring and analytics
4. Performance profiling for AI calls
5. Implement caching layer for AI responses