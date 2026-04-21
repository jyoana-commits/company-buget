/**
 * GET /api/users
 * Returns list of users with id, name, email, role. Admin only.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getUserFromNextRequest } from "@/utils/auth";

export async function GET(request: Request) {
  const currentUser = await getUserFromNextRequest(request);

  if (!currentUser) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  if (currentUser.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { email: "asc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("List users error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
