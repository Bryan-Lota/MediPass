/**
 * Real user accounts — registration and sign-in with PBKDF2-hashed passwords
 * (100k iterations, per-user random salt, via Web Crypto), stored in a
 * localStorage-backed directory. No account is ever stored in plaintext.
 *
 * Same architectural pattern as the rest of this PoC: no real backend/database,
 * so accounts live in the browser rather than a server — but the hashing itself
 * is real, not a stand-in.
 */
import { bytesToHex, hexToBytes } from "./hex";
import type { Role } from "./types";

const USERS_KEY = "medpass_users_v1";
const PBKDF2_ITERATIONS = 100_000;

export interface UserAccount {
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  name: string;
  company: string;
  createdAt: string;
}

type UserDirectory = Record<string, UserAccount>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function loadUsers(): UserDirectory {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as UserDirectory;
  } catch {
    // fall through to empty directory
  }
  return {};
}

function saveUsers(users: UserDirectory): void {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function derivePasswordHash(password: string, saltHex: string): Promise<string> {
  const salt = hexToBytes(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function randomSaltHex(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  name: string;
  company: string;
}

export type RegisterResult = { ok: true; user: UserAccount } | { ok: false; error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const email = normalizeEmail(input.email);
  if (!email || !input.password || !input.name.trim() || !input.company.trim()) {
    return { ok: false, error: "Fill in every field." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const users = loadUsers();
  if (users[email]) {
    return { ok: false, error: "An account with this email already exists — sign in instead." };
  }
  const salt = randomSaltHex();
  const passwordHash = await derivePasswordHash(input.password, salt);
  const user: UserAccount = {
    email,
    passwordHash,
    salt,
    role: input.role,
    name: input.name.trim(),
    company: input.company.trim(),
    createdAt: new Date().toISOString(),
  };
  users[email] = user;
  saveUsers(users);
  return { ok: true, user };
}

/** Verifies credentials, returning the account on success or null on any mismatch. */
export async function verifyUser(email: string, password: string): Promise<UserAccount | null> {
  const users = loadUsers();
  const user = users[normalizeEmail(email)];
  if (!user) return null;
  const hash = await derivePasswordHash(password, user.salt);
  return hash === user.passwordHash ? user : null;
}

export function getUser(email: string): UserAccount | undefined {
  return loadUsers()[normalizeEmail(email)];
}

export function updateUserProfile(email: string, updates: Partial<Pick<UserAccount, "name" | "company">>): UserAccount | undefined {
  const users = loadUsers();
  const key = normalizeEmail(email);
  const existing = users[key];
  if (!existing) return undefined;
  const next = { ...existing, ...updates };
  users[key] = next;
  saveUsers(users);
  return next;
}

const DEMO_PASSWORD = "demo1234";

/** Seeds two ready-to-use demo accounts (one per role) the first time the app runs in a browser. */
export async function ensureSeedUsers(): Promise<void> {
  const users = loadUsers();
  if (Object.keys(users).length > 0) return;

  const seed: RegisterInput[] = [
    {
      email: "demo.manufacturer@medpass.io",
      password: DEMO_PASSWORD,
      role: "manufacturer",
      name: "Jordan Reyes",
      company: "Acme MedTech Ltd.",
    },
    {
      email: "demo.regulator@medpass.io",
      password: DEMO_PASSWORD,
      role: "regulator",
      name: "Sam Okafor",
      company: "EU/FDA Verifier Office",
    },
  ];

  const next: UserDirectory = {};
  for (const input of seed) {
    const salt = randomSaltHex();
    const passwordHash = await derivePasswordHash(input.password, salt);
    next[normalizeEmail(input.email)] = {
      email: normalizeEmail(input.email),
      passwordHash,
      salt,
      role: input.role,
      name: input.name,
      company: input.company,
      createdAt: new Date().toISOString(),
    };
  }
  saveUsers(next);
}

export const DEMO_ACCOUNTS = {
  manufacturer: { email: "demo.manufacturer@medpass.io", password: DEMO_PASSWORD },
  regulator: { email: "demo.regulator@medpass.io", password: DEMO_PASSWORD },
};
