import { db } from './db.js';
import { userSessions, cache } from '../models/schema.js';
import { lt } from 'drizzle-orm';

export async function cleanupExpiredData() {
  const now = new Date();
  
  try {
    // Clean up expired sessions
    await db
      .delete(userSessions)
      .where(lt(userSessions.expiresAt, now));
    
    // Clean up expired cache entries
    await db
      .delete(cache)
      .where(lt(cache.expiresAt, now));
    
    console.log(`[Cleanup] Removed expired sessions and cache entries at ${now.toISOString()}`);
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error);
  }
}

// Run cleanup every hour
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupSchedule() {
  // Run initial cleanup
  cleanupExpiredData();
  
  // Schedule cleanup every hour
  cleanupInterval = setInterval(() => {
    cleanupExpiredData();
  }, 60 * 60 * 1000); // 1 hour
}

export function stopCleanupSchedule() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}