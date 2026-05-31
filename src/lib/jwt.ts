import jwt from 'jsonwebtoken';
import { getErrorMessage } from '@/lib/errors';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET env var is missing or too short (min 32 chars). Cannot start.'
    );
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string | null;
  sessionVersion?: number;
}

export function signToken(payload: JWTPayload) {
  try {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
  } catch (error) {
    console.error('Token sign error:', error);
    return null;
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    if (msg === 'jwt malformed' || msg === 'invalid token') {
      return null;
    }
    console.error('Token verify error:', error);
    return null;
  }
}
