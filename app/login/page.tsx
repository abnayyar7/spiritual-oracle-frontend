"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const { data, error } =
      mode === "sign-up"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "sign-up" && !data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    router.push("/oracle");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-950">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {mode === "sign-in"
            ? "Continue to your oracle session."
            : "Use email and password to begin."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950 outline-none transition focus:border-stone-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="mt-2 h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950 outline-none transition focus:border-stone-950"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>

        {message ? (
          <p className="mt-5 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
          className="mt-6 text-sm font-medium text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline"
        >
          {mode === "sign-in"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
