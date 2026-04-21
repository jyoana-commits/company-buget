/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success: sets auth_token cookie and returns { user: { id, name, email } }.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserToken, serializeAuthCookie } from "@/utils/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true, role: true },
    });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const cookie = serializeAuthCookie(token);

    const response = NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
