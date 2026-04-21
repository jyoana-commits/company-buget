/**
 * PATCH /api/users/[id]
 * Body: { role: "ADMIN" | "MANAGER" | "GUEST" }. Admin only.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getUserFromNextRequest } from "@/utils/auth";
import type { UserRole } from "@/utils/auth";

const ROLES: UserRole[] = ["ADMIN", "MANAGER", "GUEST"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "Invalid user id" },
      { status: 400 }
    );
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const role = body.role;
  if (!role || !ROLES.includes(role as UserRole)) {
    return NextResponse.json(
      { message: "role must be one of: ADMIN, MANAGER, GUEST" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      user: {
        id: String(updated.id),
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (e) {
    const prismaError = e as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    // eslint-disable-next-line no-console
    console.error("Update user role error", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
