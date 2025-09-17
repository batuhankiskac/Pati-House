import { NextRequest, NextResponse } from 'next/server';
import { createSession, authenticateUser } from '@/lib/auth';
import { setAuthCookie } from '@/lib/auth-session';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      const duration = Date.now() - startTime;
      logger.http('POST', '/api/login', 400, duration, {
        message: 'Username and password are required'
      });
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(username, password);
    if (!user) {
      const duration = Date.now() - startTime;
      logger.http('POST', '/api/login', 401, duration, {
        message: 'Invalid username or password',
        username
      });
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session with JWT token
    const sessionResult = await createSession(username, password);
    if (!sessionResult.success || !sessionResult.token) {
      const duration = Date.now() - startTime;
      logger.http('POST', '/api/login', 500, duration, {
        message: 'Session could not be created'
      });
      return NextResponse.json(
        { error: 'Session could not be created' },
        { status: 500 }
      );
    }

    setAuthCookie(sessionResult.token);

    const duration = Date.now() - startTime;
    logger.http('POST', '/api/login', 200, duration, {
      message: 'Login successful',
      userId: user.id,
      username: user.username
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
