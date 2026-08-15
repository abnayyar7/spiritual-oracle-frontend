"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import AuthCard, {
  AuthStatus,
  AuthSubmit,
} from "@/app/components/auth/auth-card";
import TextField from "@/app/components/ui/text-field";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    /*
     * redirectTo must also be listed in Supabase Auth → URL Configuration →
     * Redirect URLs, or the emailed link is rejected. window.location.origin
     * keeps localhost and production working without an env var.
     */
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        heading="Check Your Email"
        sub="If an account exists for that address, a reset link is on its way."
        footer={
          <Link
            href="/login"
            className="text-accent underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        }
      >
        <AuthStatus kind="notice">
          Check your email for a reset link. It expires after a short while —
          request another if it lapses.
        </AuthStatus>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Reset Your Password"
      sub="Enter your email and we'll send you a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-accent underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {error && <AuthStatus kind="error">{error}</AuthStatus>}

      <form className="mt-4 space-y-1" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          disabled={isLoading}
          autoComplete="email"
        />
        <div className="pt-5">
          <AuthSubmit
            isLoading={isLoading}
            idle="Send Reset Link"
            pending="Sending…"
          />
        </div>
      </form>
    </AuthCard>
  );
}
