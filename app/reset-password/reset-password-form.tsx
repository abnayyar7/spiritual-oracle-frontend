"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import AuthCard, {
  AuthStatus,
  AuthSubmit,
} from "@/app/components/auth/auth-card";
import TextField from "@/app/components/ui/text-field";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(
    null,
  );

  /*
   * Arriving from the emailed link puts Supabase into a temporary recovery
   * session. Without it updateUser() has no user to update, so check once on
   * mount and show a useful message instead of a raw API error.
   */
  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setHasRecoverySession(Boolean(data.session));
      })
      .catch(() => {
        if (!cancelled) setHasRecoverySession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setConfirmError("");

    if (password !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    router.push("/login?reset=1");
    router.refresh();
  }

  return (
    <AuthCard
      heading="Set a New Password"
      sub="Choose a password you haven't used before."
      footer={
        <Link
          href="/login"
          className="text-accent underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      }
    >
      {hasRecoverySession === false && (
        <AuthStatus kind="error">
          This reset link is invalid or has expired. Request a new one from the
          forgot-password page.
        </AuthStatus>
      )}
      {error && <AuthStatus kind="error">{error}</AuthStatus>}

      <form className="mt-4 space-y-1" onSubmit={handleSubmit}>
        <TextField
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
          minLength={6}
          autoComplete="new-password"
        />
        <TextField
          id="confirm"
          label="Confirm New Password"
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
        <div className="pt-5">
          <AuthSubmit
            isLoading={isLoading}
            idle="Reset Password"
            pending="Updating…"
          />
        </div>
      </form>
    </AuthCard>
  );
}
