"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import TextField from "@/app/components/ui/text-field";
import { createClient } from "@/lib/supabase/client";

/*
 * Shared auth form for /login and /signup.
 *
 * The Supabase calls are unchanged from the original single-page version —
 * signInWithPassword / signUp, the "confirm your email" branch when signUp
 * returns no session, then push to /oracle. The only logic added is
 * client-side confirm-password matching, which the sign-up form did not have
 * because it had no confirm field.
 */

export type AuthMode = "sign-in" | "sign-up";

const COPY = {
  "sign-in": {
    heading: "Welcome Back",
    sub: "Continue to your oracle session.",
    submit: "Log In",
    pending: "Signing in…",
    altPrompt: "Don't have an account?",
    altLabel: "Sign up",
    altHref: "/signup",
  },
  "sign-up": {
    heading: "Begin Your Journey",
    sub: "Create an account to ask your first question.",
    submit: "Create Account",
    pending: "Creating account…",
    altPrompt: "Already have an account?",
    altLabel: "Log in",
    altHref: "/login",
  },
} as const;

/** An auth failure and a "check your email" notice are not the same thing and
 *  should not look the same. */
type Status = { kind: "error" | "notice"; text: string } | null;

export default function AuthForm({
  mode,
  initialNotice,
}: {
  mode: AuthMode;
  /** Shown before any interaction — e.g. "password updated" after a reset. */
  initialNotice?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [status, setStatus] = useState<Status>(
    initialNotice ? { kind: "notice", text: initialNotice } : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setConfirmError("");

    if (mode === "sign-up" && password !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { data, error } =
      mode === "sign-up"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setStatus({ kind: "error", text: error.message });
      return;
    }

    if (mode === "sign-up" && !data.session) {
      setStatus({
        kind: "notice",
        text: "Check your email to confirm your account, then log in.",
      });
      return;
    }

    // Check onboarding_complete flag to route appropriately
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${data.user?.id || ""}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        if (profile.onboarding_complete === false || profile.onboarding_complete === null) {
          router.push("/onboarding");
          return;
        }
      }
    } catch (e) {
      // If profile fetch fails for new signups, route to onboarding
      if (mode === "sign-up") {
        router.push("/onboarding");
        return;
      }
    }

    router.push("/oracle");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-wide text-primary transition-colors hover:text-accent"
        >
          Spiritual Oracle
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-elevated p-6 shadow-lg sm:mt-8 sm:p-8">
        <h1 className="font-display text-3xl font-light text-primary sm:text-4xl">
          {copy.heading}
        </h1>
        <p className="mt-2 text-sm text-secondary">{copy.sub}</p>

        {status && (
          <p
            role={status.kind === "error" ? "alert" : "status"}
            className={`mt-6 rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm ${
              status.kind === "error" ? "text-danger" : "text-note"
            }`}
          >
            {status.text}
          </p>
        )}

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

          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            disabled={isLoading}
            minLength={6}
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
          />

          {mode === "sign-in" && (
            <div className="pt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {mode === "sign-up" && (
            <TextField
              id="confirm"
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                if (confirmError) setConfirmError("");
              }}
              disabled={isLoading}
              minLength={6}
              autoComplete="new-password"
              error={confirmError}
            />
          )}

          <div className="pt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium tracking-wide text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-on-accent/40 border-t-on-accent"
                />
              )}
              {isLoading ? copy.pending : copy.submit}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          {copy.altPrompt}{" "}
          <Link
            href={copy.altHref}
            className="text-accent underline-offset-4 hover:underline"
          >
            {copy.altLabel}
          </Link>
        </p>
      </section>
    </div>
  );
}
