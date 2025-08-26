import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthSession {
  user: {
    id: string;
    name: string;
  };
}

export async function createSession(password: string): Promise<boolean> {
  if (password !== 'admin') {
    return false;
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return true;
  } catch (error) {
    console.error('Cookie set error:', error);
    return false;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');

  if (authToken?.value === 'authenticated') {
    return {
      user: {
        id: '1',
        name: 'Admin'
      }
    };
  }

  return null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}
