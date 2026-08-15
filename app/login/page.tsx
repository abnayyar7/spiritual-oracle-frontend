import type { Metadata } from "next";

import AuthForm from "@/app/components/auth/auth-form";

export const metadata: Metadata = { title: "Log In — Spiritual Oracle" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { reset?: string };
}) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <AuthForm
        mode="sign-in"
        initialNotice={
          searchParams.reset === "1"
            ? "Your password has been updated. Log in with your new password."
            : undefined
        }
      />
    </main>
  );
}
