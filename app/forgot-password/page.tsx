import type { Metadata } from "next";

import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password — Spiritual Oracle" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <ForgotPasswordForm />
    </main>
  );
}
