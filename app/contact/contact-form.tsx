"use client";

import { FormEvent, useState } from "react";

import TextField from "@/app/components/ui/text-field";

/*
 * UI only — there is no backend for this yet. handleSubmit logs and shows the
 * confirmation state; wire it to an email service or a Supabase table before
 * launch, and remove the notice under the form when you do.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    // eslint-disable-next-line no-console
    console.log("[contact] not yet wired to a backend:", {
      name,
      email,
      message,
    });
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-elevated p-8 text-center">
        <h2 className="font-display text-2xl font-light text-primary">
          Thanks — we&apos;ll be in touch
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-secondary">
          Your message has been noted. We read everything, and corrections to a
          translation always get a reply.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setMessage("");
          }}
          className="mt-6 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm text-accent transition-colors hover:bg-surface-2"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-1 rounded-2xl border border-line bg-elevated p-6 sm:p-8"
    >
      <TextField
        id="name"
        label="Name"
        value={name}
        onChange={setName}
        disabled={isLoading}
        autoComplete="name"
      />
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
        id="message"
        label="Message"
        value={message}
        onChange={setMessage}
        disabled={isLoading}
        multiline
        rows={6}
      />
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
          {isLoading ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
