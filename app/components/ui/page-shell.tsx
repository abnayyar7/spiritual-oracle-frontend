import type { ReactNode } from "react";

/*
 * Layout primitives shared by the content pages, so headings, widths and
 * vertical rhythm stay identical across About / Pricing / Contact / Account /
 * History / Settings / legal.
 */

export function PageShell({
  children,
  width = "prose",
}: {
  children: ReactNode;
  /** prose ~ reading column; wide ~ card grids. */
  width?: "prose" | "wide" | "narrow";
}) {
  const max =
    width === "wide"
      ? "max-w-5xl"
      : width === "narrow"
        ? "max-w-md"
        : "max-w-3xl";

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-surface px-5 py-14 sm:px-6 sm:py-20">
      <div className={`mx-auto w-full ${max}`}>{children}</div>
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <header className={`${alignment} mb-10 sm:mb-14`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl font-light leading-tight text-primary sm:text-5xl">
        {title}
      </h1>
      {lead && (
        <p
          className={`mt-4 text-base leading-7 text-secondary sm:text-lg sm:leading-8 ${
            align === "center" ? "mx-auto max-w-xl" : "max-w-2xl"
          }`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 sm:mb-12">
      {title && (
        <h2 className="mb-3 font-display text-2xl font-light text-primary sm:text-3xl">
          {title}
        </h2>
      )}
      <div className="space-y-4 leading-7 text-secondary">{children}</div>
    </section>
  );
}

export function Card({
  children,
  className = "",
  highlighted = false,
}: {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-elevated p-6 sm:p-8",
        highlighted
          ? "border-accent shadow-lg"
          : "border-line shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] uppercase tracking-[0.14em]",
        tone === "accent"
          ? "border-accent text-accent"
          : "border-line-strong text-secondary",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
