import type { Context } from 'hono';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  generateTokens,
  createSession,
  deleteSession,
  verifyRefreshToken,
  getUserById
} from '../utils/auth.js';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../models/auth.js';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const refreshSchema = z.object({
  refreshToken: z.string()
});

export const googleLoginSchema = z.object({
  credential: z.string()
});

export async function register(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as RegisterRequest;
    const { email, password, username } = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }
    
    // Create user
    const user = await createUser(email, password, username);
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Create session
    await createSession(user.id, tokens.refreshToken);
    
    const response: AuthResponse = { user, tokens };
    return c.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400);
    }
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
}

export async function login(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as LoginRequest;
    const { email, password } = loginSchema.parse(body);
    
    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Get full user record with password hash
    const { db } = await import('../utils/db.js');
    const { users } = await import('../models/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const userWithPassword = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (!userWithPassword[0]) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Check if user is using OAuth
    if (userWithPassword[0].authProvider !== 'local') {
      return c.json({ error: `Please use ${userWithPassword[0].authProvider} login` }, 401);
    }
    
    // Verify password
    const isValid = await verifyPassword(password, userWithPassword[0].passwordHash);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Create session
    await createSession(user.id, tokens.refreshToken);
    
    const response: AuthResponse = { user, tokens };
    return c.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400);
    }
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
}

export async function logout(c: Context): Promise<Response> {
  try {
    const authHeader = c.req.header('Authorization');
    const body = await c.req.json() as { refreshToken?: string };
    
    if (body.refreshToken) {
      await deleteSession(body.refreshToken);
    }
    
    return c.json({ message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
}

export async function refresh(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as { refreshToken: string };
    const { refreshToken } = refreshSchema.parse(body);
    
    // Verify refresh token
    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
      return c.json({ error: 'Invalid refresh token' }, 401);
    }
    
    // Get user
    const user = await getUserById(userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Delete old session
    await deleteSession(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(user.id);
    
    // Create new session
    await createSession(user.id, tokens.refreshToken);
    
    const response: AuthResponse = { user, tokens };
    return c.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400);
    }
    console.error('Refresh error:', error);
    return c.json({ error: 'Token refresh failed' }, 500);
  }
}

export async function getMe(c: Context): Promise<Response> {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }
  
  return c.json({ user });
}

export async function googleLogin(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as { credential: string };
    const { credential } = googleLoginSchema.parse(body);
    
    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return c.json({ error: 'Invalid Google token' }, 401);
    }
    
    const { email, name, picture, sub: googleId } = payload;
    
    if (!email) {
      return c.json({ error: 'No email in Google account' }, 400);
    }
    
    // Check if user exists
    let user = await getUserByEmail(email);
    
    if (!user) {
      // Create new user with Google auth
      const { db } = await import('../utils/db.js');
      const { users } = await import('../models/schema.js');
      const { nanoid } = await import('nanoid');
      
      const userId = nanoid();
      const now = new Date();
      
      await db.insert(users).values({
        id: userId,
        email: email.toLowerCase(),
        username: name || email.split('@')[0],
        authProvider: 'google',
        googleId,
        profilePicture: picture,
        passwordHash: null,
        createdAt: now,
        updatedAt: now
      });
      
      user = {
        id: userId,
        email: email.toLowerCase(),
        username: name || email.split('@')[0]
      };
    } else {
      // Update existing user with Google info if needed
      const { db } = await import('../utils/db.js');
      const { users } = await import('../models/schema.js');
      const { eq } = await import('drizzle-orm');
      
      await db.update(users)
        .set({
          googleId,
          profilePicture: picture,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
    }
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Create session
    await createSession(user.id, tokens.refreshToken);
    
    const response: AuthResponse = { user, tokens };
    return c.json(response);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400);
    }
    console.error('Google login error:', error);
    return c.json({ error: 'Google login failed' }, 500);
  }
}