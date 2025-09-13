import { NextRequest, NextResponse } from 'next/server';
import { createSession, authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Create session with JWT token
    const sessionResult = await createSession(username, password);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: 'Oturum oluşturulamadı' },
        { status: 500 }
      );
    }

    // Set JWT token in cookie
    const cookieStore = await cookies();
    const COOKIE_NAME = 'auth-token';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const domain = appUrl.replace(/^https?:\/\//, '').split(':')[0];

    cookieStore.set(COOKIE_NAME, sessionResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? domain : undefined,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
