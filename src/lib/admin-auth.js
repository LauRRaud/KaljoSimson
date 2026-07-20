import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { cookies } from "next/headers";

const COOKIE_NAME = "ks_admin";
const SESSION_VALUE = "authenticated";

// Adminis vahetatud parool elab soolatud räsina siin failis (gitist väljas).
// Kui faili ei ole, kehtib KS_ADMIN_PASSWORD keskkonnamuutujast.
const PASSWORD_FILE = path.join(
  process.cwd(),
  "content",
  "admin-password.local.json",
);

// Taastevõti elab ainult serveri keskkonnamuutujas (KS_ADMIN_RECOVERY_KEY).
// Kui seda ei ole, jääb taastamise vorm login-lehel üldse näitamata.
const RECOVERY_MIN_KEY_LENGTH = 16;
const RECOVERY_MAX_ATTEMPTS = 5;
const RECOVERY_LOCKOUT_MS = 15 * 60 * 1000;

let recoveryAttempts = 0;
let recoveryLockedUntil = 0;

function getSessionSecret() {
  return process.env.KS_SESSION_SECRET || "kaljosimson-session-secret-change-me";
}

function getEnvPassword() {
  return process.env.KS_ADMIN_PASSWORD || "kaljosimson-admin";
}

function getRecoveryKey() {
  const key = process.env.KS_ADMIN_RECOVERY_KEY;

  return typeof key === "string" && key.length >= RECOVERY_MIN_KEY_LENGTH
    ? key
    : null;
}

export function isRecoveryEnabled() {
  return getRecoveryKey() !== null;
}

export function getRecoveryLockRemainingMs() {
  return Math.max(0, recoveryLockedUntil - Date.now());
}

export function verifyRecoveryKey(key) {
  const expectedKey = getRecoveryKey();

  if (!expectedKey || getRecoveryLockRemainingMs() > 0) {
    return false;
  }

  const candidate = Buffer.from(String(key));
  const expected = Buffer.from(expectedKey);
  const matches =
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected);

  if (matches) {
    recoveryAttempts = 0;
  } else if (++recoveryAttempts >= RECOVERY_MAX_ATTEMPTS) {
    recoveryLockedUntil = Date.now() + RECOVERY_LOCKOUT_MS;
    recoveryAttempts = 0;
  }

  return matches;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

async function readStoredPassword() {
  try {
    const raw = await readFile(PASSWORD_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (typeof parsed?.salt === "string" && typeof parsed?.hash === "string") {
      return parsed;
    }
  } catch {
    // faili ei ole või on vigane — kehtib env-parool
  }

  return null;
}

export async function verifyAdminPassword(password) {
  const stored = await readStoredPassword();

  if (stored) {
    const candidate = Buffer.from(hashPassword(password, stored.salt), "hex");
    const expected = Buffer.from(stored.hash, "hex");

    return (
      candidate.length === expected.length &&
      crypto.timingSafeEqual(candidate, expected)
    );
  }

  const candidate = Buffer.from(String(password));
  const expected = Buffer.from(getEnvPassword());

  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

export async function setAdminPassword(newPassword) {
  const salt = crypto.randomBytes(16).toString("hex");

  await mkdir(path.dirname(PASSWORD_FILE), { recursive: true });
  await writeFile(
    PASSWORD_FILE,
    JSON.stringify({ salt, hash: hashPassword(newPassword, salt) }, null, 2),
  );
}

function buildCookieValue() {
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(SESSION_VALUE)
    .digest("hex");

  return `${SESSION_VALUE}.${signature}`;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  return cookieValue === buildCookieValue();
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, buildCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
