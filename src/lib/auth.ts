import type { Shipment } from './types';

const CUSTOMER_SESSION_KEY = 'scs_customer_session_v1';
const CUSTOMER_ACCOUNTS_KEY = 'scs_customer_accounts_v1';

export interface CustomerSession {
  name: string;
  email: string;
}

interface CustomerAccount extends CustomerSession {
  salt: string;
  passwordHash: string;
}

const CUSTOMER_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: Uint8Array.from(atob(salt), (char) => char.charCodeAt(0)), iterations: 310_000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function legacyPasswordHash(password: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function newSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...salt));
}

export function isStrongCustomerPassword(password: string) {
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

function readCustomerAccounts(): CustomerAccount[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_ACCOUNTS_KEY) || '[]') as CustomerAccount[];
  } catch {
    return [];
  }
}

function emailMatchesShipment(email: string, shipment: Shipment) {
  const normalized = email.trim().toLowerCase();
  return [shipment.customerEmail, shipment.sender.email, shipment.recipient.email]
    .some((value) => value.trim().toLowerCase() === normalized);
}

export function readCustomerSession(): CustomerSession | null {
  try {
    // Remove sessions created by older versions that persisted across browser restarts.
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    // Keep the signed-in session scoped to this browser tab. Closing the tab/app
    // ends the session instead of restoring the previous customer's details later.
    const stored = JSON.parse(sessionStorage.getItem(CUSTOMER_SESSION_KEY) || 'null') as (CustomerSession & { expiresAt?: number }) | null;
    if (!stored || typeof stored.expiresAt !== 'number' || stored.expiresAt <= Date.now()) {
      sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
      return null;
    }
    return { name: stored.name, email: stored.email };
  } catch {
    return null;
  }
}

export function endCustomerSession() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
}

export async function registerCustomerAccount(
  name: string,
  email: string,
  password: string,
  shipments: Shipment[],
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !isStrongCustomerPassword(password)) {
    return { ok: false as const, error: 'Use a valid email and a password with at least 12 characters, including uppercase, lowercase, and a number.' };
  }
  if (!shipments.some((shipment) => emailMatchesShipment(normalizedEmail, shipment))) {
    return { ok: false as const, error: 'No shipment is registered to that email. Check the email with your operations contact.' };
  }

  const accounts = readCustomerAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    return { ok: false as const, error: 'An account already exists for this email. Please sign in.' };
  }

  const salt = newSalt();
  const account = { name: name.trim(), email: normalizedEmail, salt, passwordHash: await hashPassword(password, salt) };
  localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  const session = { name: account.name, email: account.email, expiresAt: Date.now() + CUSTOMER_SESSION_TTL_MS };
  sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session } as const;
}

export async function signInCustomer(email: string, password: string) {
  const accounts = readCustomerAccounts();
  const account = accounts.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
  const passwordMatches = account && (account.salt
    ? account.passwordHash === await hashPassword(password, account.salt)
    : account.passwordHash === await legacyPasswordHash(password));
  if (!account || !passwordMatches) {
    return { ok: false as const, error: 'Email or password is incorrect.' };
  }
  if (!account.salt) {
    account.salt = newSalt();
    account.passwordHash = await hashPassword(password, account.salt);
    localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  const session = { name: account.name, email: account.email, expiresAt: Date.now() + CUSTOMER_SESSION_TTL_MS };
  sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session } as const;
}
