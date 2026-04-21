import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import AuthForm from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;
    if (token && verifyToken(token)) {
      redirect("/budget");
    }
  } catch {
    // e.g. missing JWT_SECRET; show signup form
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <Image
          src="/logo.svg"
          alt="Budget Statistics"
          width={72}
          height={72}
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Budget statistics
        </h1>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}

