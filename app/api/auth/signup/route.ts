/**
 * POST /api/auth/signup
 * Body: { name, email, password } (password min 6 chars)
 * On success: creates user, sets auth_token cookie, returns { user: { id, name, email } }.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserToken, serializeAuthCookie } from "@/utils/auth";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters long" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const cookie = serializeAuthCookie(token);

    const response = NextResponse.json(
      {
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Signup error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
