import Link from "next/link";

import HeaderNav from "@/app/components/header-nav";
import { getSessionUser } from "@/lib/auth";

/*
 * Sticky app header.
 *
 * Server Component: it resolves the session here so the signed-in and
 * signed-out variants render correctly on first paint, with no client-side
 * flash between them. The interactive parts — account dropdown, mobile drawer
 * — live in HeaderNav.
 *
 * Because this reads cookies and sits in the root layout, every route becomes
 * dynamically rendered. That is inherent to a session-aware header; if static
 * generation matters for marketing pages later, the fix is to move the header
 * below a per-route boundary rather than to guess the session on the client.
 *
 * Height is fixed at 4rem and the homepage subtracts it from the viewport, so
 * the hero fills exactly one screen. Change one, change the other.
 */

export default async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="font-display text-xl font-medium tracking-wide text-primary transition-colors hover:text-accent sm:text-2xl"
        >
          Spiritual Oracle
        </Link>

        <HeaderNav email={user?.email ?? null} isSignedIn={Boolean(user)} />
      </div>
    </header>
  );
}
