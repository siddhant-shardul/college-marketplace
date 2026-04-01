"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { Alert, Button, Field } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
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
          data: { full_name: trimmedName },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setMessage("Account created. Check your email to verify your account before signing in.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.session.user.id,
          full_name: trimmedName,
          email: trimmedEmail,
        },
        { onConflict: "id" },
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
    <AuthShell
      badge="Join your campus"
      heroTitle="Create your account and start trading without the student-project mess."
      heroDescription="The signup flow now feels deliberate: clearer hierarchy, better spacing, stronger feedback, and a visual tone that matches a real product."
      heroPoints={[
        "A cleaner onboarding surface with clearer expectations",
        "Inline validation and disabled states that actually read well",
        "Immediate access to listings, messages, and seller tools after signup",
      ]}
      footerNote="First impressions matter. The account creation flow now looks worth trusting."
      eyebrow="Create account"
      title="Set up your marketplace profile"
      subtitle="Use your name, college email, and a secure password to get started."
    >
      <form onSubmit={handleSignup} className="space-y-5">
        <Field
          label="Full name"
          placeholder="Your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          required
        />
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
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          hint="Use something you won’t forget."
          required
        />

        {message ? <Alert tone="danger">{message}</Alert> : null}

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900 hover:text-indigo-600">
              Log in instead
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
