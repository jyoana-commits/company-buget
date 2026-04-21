import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let isAuthed = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    isAuthed = !!token && !!verifyToken(token);
  } catch {
    // e.g. missing JWT_SECRET; send to login
  }
  redirect(isAuthed ? "/budget" : "/auth/login");
}

