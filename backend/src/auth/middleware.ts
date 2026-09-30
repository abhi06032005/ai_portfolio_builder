import { Context, Next } from 'hono';
import { Env } from '../types/env';
import { errorResponse } from '../utils/response';

export interface AuthUser {
  id: string;      // D1 internal user id
  clerkId: string; // External auth ID
  email: string;
  tier: 'normal' | 'paid';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    userId: string;
  }
}

import { verifyJwt } from './jwt';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return errorResponse('Empty bearer token provided', 401, 'UNAUTHORIZED');
  }

  const verification = await verifyJwt(token, {
    jwtSecret: c.env.JWT_SECRET,
    clerkSecretKey: c.env.CLERK_SECRET_KEY,
    allowDevBypass: true, // Graceful fallback in local dev without clerk keys
  });

  if (!verification.valid || !verification.payload) {
    return errorResponse(verification.error || 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }

  const payload = verification.payload;
  const clerkId = payload.sub;
  const email = payload.email || payload.primary_email || `${clerkId}@user.auth`;

  // Look up user in D1, or auto-provision on first request
  const existingUser = await c.env.DB.prepare(
    'SELECT id, email, username, tier FROM users WHERE id = ? OR email = ? LIMIT 1',
  )
    .bind(clerkId, email)
    .first<{ id: string; email: string; username: string | null; tier: string }>();

  let user: AuthUser;

  if (existingUser) {
    user = {
      id: existingUser.id,
      clerkId,
      email: existingUser.email,
      tier: (existingUser.tier as 'normal' | 'paid') || 'normal',
    };
  } else {
    // Auto-provision new user in D1
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, username, tier, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
    )
      .bind(clerkId, email, payload.username || null, 'normal')
      .run();

    user = {
      id: clerkId,
      clerkId,
      email,
      tier: 'normal',
    };
  }

  c.set('user', user);
  c.set('userId', user.id);
  await next();
}
