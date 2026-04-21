/**
 * Shared form for login and signup. Used on /auth/login and /auth/signup pages.
 * On success redirects to /budget. Signup also logs the user in (cookie set by API).
 */
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
        await router.push("/budget");
      } else {
        setSuccess("Account created! Redirecting to budget...");
        setTimeout(() => {
          router.push("/budget");
        }, 600);
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {!isLogin && (
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="w-full rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        {error && <div className="text-xs text-rose-400">{error}</div>}
        {success && <div className="text-xs text-emerald-400">{success}</div>}

        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading
            ? isLogin
              ? "Logging in..."
              : "Creating account..."
            : isLogin
            ? "Login"
            : "Sign Up"}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-slate-400">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/signup")}
              className="font-medium hidden text-sky-400 hover:text-sky-300"
            >
              Create one
            </button>
            .
          </>
        ) : (
          <>
            Already registered?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Login
            </button>
            .
          </>
        )}
      </div>
    </div>
  );
}

