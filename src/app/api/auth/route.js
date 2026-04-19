import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    // Securely verify access_token with Google
    const verifyRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!verifyRes.ok) {
      const gErr = await verifyRes.json();
      return NextResponse.json({ error: 'Invalid Google Token', details: gErr }, { status: 401 });
    }
    
    const payload = await verifyRes.json();
    const ADMIN_EMAIL = (process.env.EMAIL_USER || '').toLowerCase();
    
    const authorized = payload.email && ADMIN_EMAIL && payload.email.toLowerCase() === ADMIN_EMAIL;

    if (authorized) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_token', 'google_authenticated', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ 
      error: 'Unauthorized email', 
      details: { 
        youTryingToLoginWith: payload.email, 
        butTheSystemExpects: ADMIN_EMAIL 
      } 
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token === 'google_authenticated') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', { maxAge: 0 });
  return response;
}
