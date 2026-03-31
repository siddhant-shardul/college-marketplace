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

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName) {
        setMessage("Full name is required.");
        return;
      }

      if (password.length < 6) {
        setMessage("Password must be at least 6 characters long.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setMessage(
          "Account created. Check your email to verify your account before signing in."
        );
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.session.user.id,
          full_name: trimmedName,
          email: trimmedEmail,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        setMessage("Signup worked, but profile was not saved.");
        return;
      }

      router.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Signup failed.");
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
              Join your campus market
            </div>

            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create your account and start trading.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Post items, discover deals from other students, and manage
              everything in one simple campus marketplace.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-200">
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Buy and sell inside your college
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Upload item images and details
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                Chat directly with interested users
              </p>
            </div>
          </div>

          <div className="relative mt-10 hidden text-sm text-slate-300 lg:block">
            Fast onboarding. No friction. Start selling immediately.
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-8 sm:py-12">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Create account
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Sign Up
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className={labelBase}>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            <button type="submit" className={buttonBase} disabled={submitting}>
              {submitting ? "Creating account..." : "Sign Up"}
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