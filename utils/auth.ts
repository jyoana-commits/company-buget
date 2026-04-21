/**
 * Authentication utilities: JWT creation/verification and cookie handling.
 * Used by auth API routes and by getServerSideProps to protect pages.
 *
 * Cookie name: auth_token (HTTP-only, SameSite=Lax, 7-day max-age).
 */

import jwt from "jsonwebtoken";
import { parse } from "cookie";

const TOKEN_COOKIE_NAME = "auth_token";

/** Server-only: do NOT use NEXT_PUBLIC_ or the secret will be exposed to the client. */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) {
    throw new Error(
      "Missing JWT_SECRET. Add JWT_SECRET to .env or .env.local for server-only use."
    );
  }
  return secret;
}

/** User privilege roles. */
export type UserRole = "ADMIN" | "MANAGER" | "GUEST";

/** Payload stored in the JWT (sub = user id). */
interface TokenPayload {
  sub: string;
  email: string;
  name?: string;
  role?: UserRole;
}

/**
 * Creates a JWT for the given user (used after login/signup).
 * Expires in 7 days.
 */
export function signUserToken(user: {
  id: string | number;
  email: string;
  name?: string;
  role?: UserRole;
}) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role ?? "GUEST"
    } as TokenPayload,
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

/** Builds the Set-Cookie header value for the auth token (HTTP-only, 7 days). */
export function serializeAuthCookie(token: string) {
  const isProd = process.env.NODE_ENV === "production";

  const cookie = [
    `${TOKEN_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=604800"
  ];

  if (isProd) {
    cookie.push("Secure");
  }

  return cookie.join("; ");
}

/** Builds the Set-Cookie header value to clear the auth cookie (logout). */
export function serializeClearAuthCookie() {
  const isProd = process.env.NODE_ENV === "production";

  const cookie = [
    `${TOKEN_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (isProd) {
    cookie.push("Secure");
  }

  return cookie.join("; ");
}

/** Reads the auth_token from the request Cookie header. */
export function getTokenFromRequest(req: { headers: { cookie?: string } }) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[TOKEN_COOKIE_NAME] || null;
}

/** Verifies the JWT and returns the payload, or null if invalid/expired. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Returns the current user from the request cookie, or null if not authenticated.
 * Use this in getServerSideProps to protect pages and redirect to /auth/login.
 */
export async function getUserFromRequest(req: {
  headers: { cookie?: string };
}): Promise<{ id: string; email: string; name?: string; role: UserRole } | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: (payload.role as UserRole) ?? "GUEST"
  };
}

/** Adapter for App Router: get user from Web API Request (e.g. in route handlers). */
export async function getUserFromNextRequest(
  request: Request
): Promise<{ id: string; email: string; name?: string; role: UserRole } | null> {
  return getUserFromRequest({
    headers: { cookie: request.headers.get("cookie") ?? undefined },
  });
}

/**
 * Get current user from cookie string (e.g. from cookies() in App Router server components).
 * Pass the raw cookie header value or use getTokenFromCookieValue with cookieStore.get("auth_token")?.value.
 */
export function getUserFromToken(token: string | null | undefined): {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
} | null {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: (payload.role as UserRole) ?? "GUEST",
  };
}
