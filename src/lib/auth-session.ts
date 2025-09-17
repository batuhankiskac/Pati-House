import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/lib/config';
import logger from '@/lib/logger';
import { verifyToken } from '@/lib/token';

const COOKIE_NAME = AUTH_CONFIG.COOKIE_NAME;
const COOKIE_MAX_AGE = AUTH_CONFIG.COOKIE_MAX_AGE;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/' as const,
  maxAge: COOKIE_MAX_AGE,
};

export async function getSession() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get(COOKIE_NAME);

    if (authToken?.value) {
      const decoded = await verifyToken(authToken.value);
      if (decoded) {
        return {
          user: {
            id: decoded.id,
            name: decoded.name,
          },
        };
      }
    }

    return null;
  } catch (error) {
    logger.error('Error getting session', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(0),
    });
  } catch (error) {
    logger.error('Error destroying session', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function requireAuth(request: NextRequest) {
  try {
    const authToken = request.cookies.get(COOKIE_NAME);

    if (!authToken) {
      logger.warn('Authentication required but no auth token found');
      return { success: false } as const;
    }

    const decoded = await verifyToken(authToken.value);
    if (!decoded) {
      logger.warn('Authentication required but token verification failed');
      return { success: false } as const;
    }

    logger.debug('Authentication successful', {
      userId: decoded.id,
      username: decoded.username,
    });
    return { success: true, user: decoded } as const;
  } catch (error) {
    logger.error('Error in requireAuth', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { success: false } as const;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}
