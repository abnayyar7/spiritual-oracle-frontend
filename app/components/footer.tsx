import Link from "next/link";

/*
 * Quiet site footer. Currently rendered only on the homepage, as specified —
 * move it into app/layout.tsx beside <Header /> to have it on every route.
 */

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <Link
          href="/"
          className="font-display text-base tracking-wide text-secondary transition-colors hover:text-primary"
        >
          Spiritual Oracle
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} Spiritual Oracle
        </p>
      </div>
    </footer>
  );
}
