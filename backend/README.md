# LifeLines Backend

A Hono-based REST API server for the LifeLines life simulation game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
npm run db:migrate
```

## Development

Run the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/turn` - Process a game turn
- `GET /api/load/:id` - Load a saved game
- `POST /api/save` - Save current game state
- `GET /health` - Health check endpoint

## Environment Variables

- `PORT` - Server port (default: 3000)
- `OPENAI_API_KEY` - Your OpenAI API key for LLM integration