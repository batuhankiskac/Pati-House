import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, User } from './data';
import { AUTH_CONFIG } from '@/lib/config';
import logger from '@/lib/logger';

// const SALT_ROUNDS = 10;
// const SECRET_KEY = process.env.SECRET_KEY || 'fallback-secret-key';
// const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
// const COOKIE_NAME = 'auth-token';

const SALT_ROUNDS = AUTH_CONFIG.SALT_ROUNDS;
const SECRET_KEY = AUTH_CONFIG.SECRET_KEY;
const JWT_SECRET = AUTH_CONFIG.JWT_SECRET;
const COOKIE_NAME = AUTH_CONFIG.COOKIE_NAME;

export async function registerUser(username: string, email: string, password: string, name: string): Promise<User | null> {
  try {
    // Check if user already exists by username
    const existingUserByUsername = await userRepository.getByUsername(username);
    if (existingUserByUsername) {
      logger.warn('User registration failed - username already exists', { username });
      return null; // User already exists
    }

    // Check if user already exists by email
    const existingUserByEmail = await userRepository.getByEmail(email);
    if (existingUserByEmail) {
      logger.warn('User registration failed - email already exists', { email });
      return null; // User already exists
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser: Omit<User, 'id'> = {
      username,
      email,
      password: hashedPassword,
      name,
      avatar: undefined
    };

    // Save to database
    const createdUser = await userRepository.create(newUser);
    logger.info('User registered successfully', { userId: createdUser.id, username });
    return createdUser;
  } catch (error) {
    logger.error('Error registering user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username,
      email
    });
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    // Find user by username
    const user = await userRepository.getByUsername(username);
    if (!user) {
      logger.warn('Authentication failed - user not found', { username });
      return null; // User not found
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Authentication failed - invalid password', { username });
      return null; // Invalid password
    }

    logger.info('User authenticated successfully', { userId: user.id, username });
    return user;
  } catch (error) {
    logger.error('Error authenticating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username
    });
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await userRepository.getById(id);
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
  };
}

// Generate JWT token for a user
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): { id: string; username: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; name: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function createSession(username: string, password: string): Promise<{ success: boolean; token?: string }> {
  const user = await authenticateUser(username, password);
  if (!user) {
    logger.warn('Session creation failed - authentication failed', { username });
    return { success: false };
  }

  try {
    // Generate JWT token
    const token = generateToken(user);
    logger.debug('Session created successfully', { userId: user.id, username });
    return { success: true, token };
  } catch (error) {
    logger.error('Token generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username
    });
    return { success: false };
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(COOKIE_NAME);

    if (authToken?.value) {
      // Verify JWT token
      const decoded = verifyToken(authToken.value);
      if (decoded) {
        return {
          user: {
            id: decoded.id,
            name: decoded.name
          }
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Cookie configuration
const COOKIE_OPTIONS = {
 httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/' as const,
  maxAge: AUTH_CONFIG.COOKIE_MAX_AGE // 7 days
};

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0, // Expire immediately
      expires: new Date(0) // Expire immediately
    });
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Middleware function to protect API routes
export async function requireAuth(request: NextRequest): Promise<{ success: boolean; user?: { id: string; username: string; name: string } }> {
  try {
    const authToken = request.cookies.get(COOKIE_NAME);

    if (!authToken) {
      logger.warn('Authentication required but no auth token found');
      return { success: false };
    }

    const decoded = verifyToken(authToken.value);
    if (!decoded) {
      logger.warn('Authentication required but token verification failed');
      return { success: false };
    }

    logger.debug('Authentication successful', { userId: decoded.id, username: decoded.username });
    return { success: true, user: decoded };
  } catch (error) {
    logger.error('Error in requireAuth', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false };
  }
}
