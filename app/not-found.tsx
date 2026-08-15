import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-6 py-16">
      <section className="w-full max-w-lg text-center">
        <p className="mb-4 font-display text-6xl font-light text-accent sm:text-7xl">
          404
        </p>
        <h1 className="font-display text-4xl font-light text-primary sm:text-5xl">
          Lost in the Forest
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-secondary">
          This path leads nowhere. Even Rama wandered fourteen years before the
          way home opened — yours is shorter.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            Return home
          </Link>
          <Link
            href="/oracle"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-6 text-sm text-accent transition-colors hover:bg-surface-2"
          >
            Ask a question
          </Link>
        </div>
      </section>
    </main>
  );
}
