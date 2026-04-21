/**
 * GET /api/auth/me
 * Returns { user: { id, email, name } } if the request has a valid auth_token cookie; 401 otherwise.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getUserFromNextRequest } from "@/utils/auth";

export async function GET(request: Request) {
  const user = await getUserFromNextRequest(request);

  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}
