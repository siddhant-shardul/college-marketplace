"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const shell =
  "min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_30%),linear-gradient(to_bottom_right,_#f8fafc,_#eef2ff_45%,_#f8fafc)] px-4 py-10 sm:px-6 lg:px-8";
const inputBase =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";
const labelBase = "block text-sm font-medium text-slate-700";
const buttonBase =
  "inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-slate-900/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={shell}>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:grid-cols-2">
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative">
            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 shadow-sm">
              Welcome back
            </div>

            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Log in to continue buying and selling.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Access your listings, chat with buyers and sellers, and manage
              your marketplace activity from one place.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-200">
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Manage your own listings
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Edit, delete, or mark items as sold
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Message buyers and sellers instantly
              </p>
            </div>
          </div>

          <div className="relative mt-10 hidden text-sm text-slate-300 lg:block">
            Simple, fast, and distraction-free marketplace access.
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Sign in
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Login
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your account details below.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            <div>
              <label className={labelBase}>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            <button type="submit" className={buttonBase} disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
