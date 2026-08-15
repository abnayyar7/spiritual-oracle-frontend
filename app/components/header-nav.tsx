"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import ThemeToggle from "@/app/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";

/*
 * Interactive half of the header: the account dropdown and the mobile drawer.
 *
 * Session state is resolved on the server and handed down as a prop, so this
 * never has to fetch or flash between signed-out and signed-in markup.
 */

export type NavLink = { label: string; href: string };

const NAV: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const ACCOUNT_LINKS: NavLink[] = [
  { label: "Account", href: "/account" },
  { label: "History", href: "/history" },
  { label: "Settings", href: "/settings" },
];

function initialFor(email: string | null) {
  return email?.trim()?.[0]?.toUpperCase() ?? "?";
}

export default function HeaderNav({
  email,
  isSignedIn,
}: {
  email: string | null;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // The drawer is portalled, which needs document — so it can only render
  // after mount, never during SSR.
  useEffect(() => setMounted(true), []);

  // Close the account dropdown on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // The drawer locks scroll while open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  async function signOut() {
    setMenuOpen(false);
    setDrawerOpen(false);
    try {
      await createClient().auth.signOut();
    } catch {
      // Network failure still clears the local view; middleware will catch up.
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ---- desktop ---- */}
      <nav className="hidden items-center gap-7 md:flex">
        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <ThemeToggle />

        {isSignedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-sm font-medium text-accent transition-colors hover:bg-elevated"
            >
              {initialFor(email)}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-11 w-52 overflow-hidden rounded-lg border border-line bg-elevated py-1 shadow-lg"
              >
                {email && (
                  <p className="truncate border-b border-line px-4 py-2 text-xs text-muted">
                    {email}
                  </p>
                )}
                {ACCOUNT_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="block w-full border-t border-line px-4 py-2 text-left text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-secondary transition-colors hover:text-primary"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* ---- mobile collapsed bar: toggle + menu button only ---- */}
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-accent"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
      </div>

      {/*
        ---- mobile drawer ----

        Portalled to <body> rather than rendered in place. The header carries
        backdrop-blur, and backdrop-filter makes an element the containing
        block for its position:fixed descendants — so an inline drawer would
        resolve `fixed inset-0` against the 64px header instead of the
        viewport, painting a 64px-tall panel with its contents spilling out
        below it. Portalling escapes that subtree entirely.
      */}
      {mounted &&
        drawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-line bg-elevated p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg text-primary">Menu</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-secondary"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 border-t border-line pt-5">
              {isSignedIn ? (
                <>
                  {email && (
                    <p className="truncate px-2 pb-3 text-xs text-muted">
                      {email}
                    </p>
                  )}
                  <nav className="flex flex-col gap-1">
                    {ACCOUNT_LINKS.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setDrawerOpen(false)}
                        className="rounded-md px-2 py-2.5 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-3 w-full rounded-full border border-line-strong px-4 py-2 text-sm text-secondary"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-md px-2 py-2 text-sm text-secondary"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setDrawerOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-medium text-on-accent"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
