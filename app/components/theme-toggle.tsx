"use client";

import { useEffect, useState } from "react";

import { getTheme, onThemeChange, setTheme, type Theme } from "@/lib/theme";

/*
 * Header theme switch.
 *
 * Initial state is read from the DOM rather than localStorage, because the
 * inline script in layout.tsx has already applied the stored value by the time
 * this mounts; reading storage again would duplicate that logic and could
 * disagree with what is on screen.
 *
 * It also subscribes to theme changes so the control on /settings and this one
 * never disagree.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setLocal] = useState<Theme>("dark");

  useEffect(() => {
    setLocal(getTheme());
    return onThemeChange(setLocal);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={[
        "inline-flex items-center gap-2 rounded-full border border-line-strong",
        "bg-surface-2 px-4 py-2 text-xs font-medium uppercase tracking-widest",
        "text-accent transition-colors hover:bg-elevated",
        className ?? "",
      ].join(" ")}
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
