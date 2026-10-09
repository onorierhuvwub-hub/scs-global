import { adminSessionCookie, createAdminSessionToken, getAdminTokenFromCookieHeader, verifyAdminSessionToken } from '@/lib/admin-session';
import { timingSafeEqual } from 'node:crypto';

function equalSecret(value: string, expected: string) {
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const token = getAdminTokenFromCookieHeader(request.headers.get('cookie'));
  return Response.json({ authenticated: verifyAdminSessionToken(token) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const username = process.env.SCS_ADMIN_USERNAME;
  const password = process.env.SCS_ADMIN_PASSWORD;
  const secret = process.env.SCS_ADMIN_SESSION_SECRET;
  if (!username || !password || !secret) {
    return Response.json({ error: 'Admin sign-in is not configured on the server.' }, { status: 503 });
  }

  let credentials: { username?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!equalSecret(credentials.username?.trim() || '', username) || !equalSecret(credentials.password || '', password)) {
    return Response.json({ error: 'Username or password is incorrect.' }, { status: 401 });
  }

  try {
    const token = createAdminSessionToken();
    return Response.json({ authenticated: true }, { headers: { 'Set-Cookie': adminSessionCookie(token), 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Admin sign-in is not configured on the server.' }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  return Response.json({ authenticated: false }, { headers: { 'Set-Cookie': adminSessionCookie('', 0), 'Cache-Control': 'no-store' } });
}
