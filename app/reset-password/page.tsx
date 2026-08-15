import type { Metadata } from "next";

import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password — Spiritual Oracle" };

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <ResetPasswordForm />
    </main>
  );
}
