import { initDatabase } from './db.js';

console.log('Running database migrations...');
initDatabase();
console.log('Database migrations completed!');