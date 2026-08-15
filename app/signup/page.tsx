import type { Metadata } from "next";

import AuthForm from "@/app/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign Up — Spiritual Oracle",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <AuthForm mode="sign-up" />
    </main>
  );
}
