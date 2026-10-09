import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_COOKIE = 'scs_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  return process.env.SCS_ADMIN_SESSION_SECRET || '';
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createAdminSessionToken() {
  const username = process.env.SCS_ADMIN_USERNAME;
  if (!username || !getSessionSecret()) throw new Error('Admin session is not configured.');
  const payload = Buffer.from(JSON.stringify({ username, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token || !getSessionSecret()) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { username?: string; expiresAt?: number };
    return session.username === process.env.SCS_ADMIN_USERNAME && typeof session.expiresAt === 'number' && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function getAdminTokenFromCookieHeader(cookieHeader: string | null) {
  const pair = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${TOKEN_COOKIE}=`));
  return pair ? decodeURIComponent(pair.slice(TOKEN_COOKIE.length + 1)) : undefined;
}

export function adminSessionCookie(token: string, maxAge = SESSION_TTL_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${TOKEN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
