import bcrypt from 'bcryptjs';
import { userRepository, type User } from './data';
import { AUTH_CONFIG } from '@/lib/config';
import logger from '@/lib/logger';
import { generateToken as signToken, verifyToken as verifyTokenInternal } from '@/lib/token';

const SALT_ROUNDS = AUTH_CONFIG.SALT_ROUNDS;

export interface AuthSession {
  user: {
    id: string;
    name: string;
  };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  name: string
): Promise<User | null> {
  try {
    const existingUserByUsername = await userRepository.getByUsername(username);
    if (existingUserByUsername) {
      logger.warn('User registration failed - username already exists', { username });
      return null;
    }

    const existingUserByEmail = await userRepository.getByEmail(email);
    if (existingUserByEmail) {
      logger.warn('User registration failed - email already exists', { email });
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: Omit<User, 'id'> = {
      username,
      email,
      password: hashedPassword,
      name,
      avatar: undefined,
    };

    const createdUser = await userRepository.create(newUser);
    logger.info('User registered successfully', { userId: createdUser.id, username });
    return createdUser;
  } catch (error) {
    logger.error('Error registering user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username,
      email,
    });
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await userRepository.getByUsername(username);
    if (!user) {
      logger.warn('Authentication failed - user not found', { username });
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Authentication failed - invalid password', { username });
      return null;
    }

    logger.info('User authenticated successfully', { userId: user.id, username });
    return user;
  } catch (error) {
    logger.error('Error authenticating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username,
    });
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await userRepository.getById(id);
  } catch (error) {
    logger.error('Error fetching user by id', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id,
    });
    return null;
  }
}

export async function generateToken(user: User): Promise<string> {
  return await signToken({
    id: user.id,
    username: user.username,
    name: user.name,
  });
}

export async function verifyToken(
  token: string
): Promise<{ id: string; username: string; name: string } | null> {
  return await verifyTokenInternal(token);
}

export async function createSession(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string }> {
  const user = await authenticateUser(username, password);
  if (!user) {
    logger.warn('Session creation failed - authentication failed', { username });
    return { success: false };
  }

  try {
    const token = await generateToken(user);
    logger.debug('Session created successfully', { userId: user.id, username });
    return { success: true, token };
  } catch (error) {
    logger.error('Token generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username,
    });
    return { success: false };
  }
}

