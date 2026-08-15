import Link from "next/link";
import type { ReactNode } from "react";

/*
 * The wordmark + card chrome shared by every auth screen, so forgot/reset
 * password sit in exactly the same frame as login and signup.
 */
export default function AuthCard({
  heading,
  sub,
  children,
  footer,
}: {
  heading: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
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
          {heading}
        </h1>
        {sub && <p className="mt-2 text-sm text-secondary">{sub}</p>}
        {children}
        {footer && (
          <div className="mt-6 text-center text-sm text-secondary">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}

/** Shared submit button so every auth action looks and behaves the same. */
export function AuthSubmit({
  isLoading,
  idle,
  pending,
}: {
  isLoading: boolean;
  idle: string;
  pending: string;
}) {
  return (
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
      {isLoading ? pending : idle}
    </button>
  );
}

/** Inline banner. Errors and notices must not look alike. */
export function AuthStatus({
  kind,
  children,
}: {
  kind: "error" | "notice";
  children: ReactNode;
}) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`mt-6 rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm ${
        kind === "error" ? "text-danger" : "text-note"
      }`}
    >
      {children}
    </p>
  );
}
