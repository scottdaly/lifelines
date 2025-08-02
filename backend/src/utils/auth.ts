import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { users, userSessions } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import type { User, AuthTokens } from '../models/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function generateTokens(userId: string): AuthTokens {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'access') return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'refresh') return null;
    
    // Check if token exists in database
    const sessions = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.refreshToken, token))
      .limit(1);
    
    if (sessions.length === 0) return null;
    if (sessions[0].expiresAt < new Date()) return null;
    
    return payload.userId;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, refreshToken: string): Promise<void> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  await db.insert(userSessions).values({
    id: sessionId,
    userId,
    refreshToken,
    expiresAt,
    createdAt: new Date()
  });
}

export async function deleteSession(refreshToken: string): Promise<void> {
  await db
    .delete(userSessions)
    .where(eq(userSessions.refreshToken, refreshToken));
}

export async function getUserById(userId: string): Promise<User | null> {
  const results = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      authProvider: users.authProvider,
      profilePicture: users.profilePicture,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return results[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const results = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      authProvider: users.authProvider,
      profilePicture: users.profilePicture,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  
  return results[0] || null;
}

export async function createUser(email: string, password: string, username: string): Promise<User> {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const passwordHash = await hashPassword(password);
  const now = new Date();
  
  await db.insert(users).values({
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    username,
    createdAt: now,
    updatedAt: now
  });
  
  return {
    id: userId,
    email: email.toLowerCase(),
    username,
    createdAt: now,
    updatedAt: now
  };
}