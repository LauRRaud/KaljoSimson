import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "beyondframes_admin";
const SESSION_VALUE = "authenticated";

function getSessionSecret() {
  return (
    process.env.BEYONDFRAMES_SESSION_SECRET ||
    "beyondframes-session-secret-change-me"
  );
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "beyondframes-admin";
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
