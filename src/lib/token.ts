import { SignJWT, jwtVerify } from 'jose';
import { AUTH_CONFIG } from '@/lib/config';

export interface AuthTokenPayload {
  id: string;
  username: string;
  name: string;
}

const encoder = new TextEncoder();

function getSecretKey(): Uint8Array {
  return encoder.encode(AUTH_CONFIG.JWT_SECRET);
}

export async function generateToken(payload: AuthTokenPayload): Promise<string> {
  const secret = getSecretKey();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify<AuthTokenPayload>(token, secret);
    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to verify auth token', error);
    }
    return null;
  }
}
