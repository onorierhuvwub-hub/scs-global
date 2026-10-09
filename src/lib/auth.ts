import type { Shipment } from './types';

const ADMIN_SESSION_KEY = 'scs_admin_session_v1';
const CUSTOMER_SESSION_KEY = 'scs_customer_session_v1';
const CUSTOMER_ACCOUNTS_KEY = 'scs_customer_accounts_v1';

// This project currently stores shipments in browser localStorage, so these credentials
// are suitable for a local demo only. Replace them with server-side authentication before
// exposing the operations dashboard to the public internet.
export const DEMO_ADMIN_USERNAME = 'admin';
export const DEMO_ADMIN_PASSWORD = 'SCS2026!';

export interface CustomerSession {
  name: string;
  email: string;
}

interface CustomerAccount extends CustomerSession {
  passwordHash: string;
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
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

export function hasAdminSession() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
}

export function startAdminSession(username: string, password: string) {
  const valid = username.trim().toLowerCase() === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD;
  if (valid) localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
  return valid;
}

export function endAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function readCustomerSession(): CustomerSession | null {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_SESSION_KEY) || 'null') as CustomerSession | null;
  } catch {
    return null;
  }
}

export function endCustomerSession() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
}

export async function registerCustomerAccount(
  name: string,
  email: string,
  password: string,
  shipments: Shipment[],
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!shipments.some((shipment) => emailMatchesShipment(normalizedEmail, shipment))) {
    return { ok: false as const, error: 'No shipment is registered to that email. Check the email with your operations contact.' };
  }

  const accounts = readCustomerAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    return { ok: false as const, error: 'An account already exists for this email. Please sign in.' };
  }

  const account = { name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) };
  localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  const session = { name: account.name, email: account.email };
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session } as const;
}

export async function signInCustomer(email: string, password: string) {
  const account = readCustomerAccounts().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.passwordHash !== await hashPassword(password)) {
    return { ok: false as const, error: 'Email or password is incorrect.' };
  }
  const session = { name: account.name, email: account.email };
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  return { ok: true, session } as const;
}
