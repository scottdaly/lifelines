import type { Context, Next } from 'hono';
import { verifyAccessToken, getUserById } from '../utils/auth.js';
import type { User } from '../models/auth.js';

// Extend Hono's context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: User | null;
    userId: string | null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    c.set('user', null);
    c.set('userId', null);
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const userId = await verifyAccessToken(token);
  
  if (!userId) {
    c.set('user', null);
    c.set('userId', null);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  
  const user = await getUserById(userId);
  if (!user) {
    c.set('user', null);
    c.set('userId', null);
    return c.json({ error: 'User not found' }, 401);
  }
  
  c.set('user', user);
  c.set('userId', userId);
  
  await next();
}

// Optional auth middleware - doesn't require auth but sets user if available
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    c.set('user', null);
    c.set('userId', null);
    await next();
    return;
  }
  
  const token = authHeader.substring(7);
  const userId = await verifyAccessToken(token);
  
  if (!userId) {
    c.set('user', null);
    c.set('userId', null);
    await next();
    return;
  }
  
  const user = await getUserById(userId);
  c.set('user', user);
  c.set('userId', userId);
  
  await next();
}