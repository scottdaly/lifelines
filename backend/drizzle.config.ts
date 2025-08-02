import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './database.sqlite',
  },
  verbose: true,
  strict: true,
} satisfies Config;