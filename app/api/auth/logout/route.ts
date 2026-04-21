/**
 * POST /api/auth/logout
 * Clears the auth_token cookie so the user is logged out.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { serializeClearAuthCookie } from "@/utils/auth";

export async function POST() {
  const cookie = serializeClearAuthCookie();
  const response = NextResponse.json({ message: "Logged out" });
  response.headers.set("Set-Cookie", cookie);
  return response;
}
