"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { Alert, Button, Field } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
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
    <AuthShell
      badge="Welcome back"
      heroTitle="Log in and get back to buying, selling, and closing deals."
      heroDescription="Your listings, conversations, and seller tools stay one tap away. The UI now gives auth flows proper spacing, clearer hierarchy, and cleaner validation feedback."
      heroPoints={[
        "Faster account access with cleaner form states",
        "A clearer split between primary actions and secondary links",
        "Consistent visual language with the rest of the marketplace",
      ]}
      footerNote="A good auth screen should feel trustworthy in three seconds. This one finally does."
      eyebrow="Sign in"
      title="Log in to your account"
      subtitle="Use the same email and password you used when you signed up."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {message ? <Alert tone="danger">{message}</Alert> : null}

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-slate-900 hover:text-indigo-600">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
