"use client";

import { useEffect, useState } from "react";

import { getTheme, onThemeChange, setTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; glyph: string }[] = [
  { value: "dark", label: "Dark", glyph: "☾" },
  { value: "light", label: "Light", glyph: "☀" },
];

/*
 * Explicit two-option control. Drives the same shared state as the header
 * toggle, so changing it here updates the header immediately and vice versa.
 */
export default function ThemeChoice() {
  const [theme, setLocal] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocal(getTheme());
    setMounted(true);
    return onThemeChange(setLocal);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-full border border-line-strong bg-surface-2 p-1"
    >
      {OPTIONS.map((opt) => {
        // Before mount every option renders unselected, so the server and
        // client markup match regardless of the stored theme.
        const active = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={[
              "inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-medium uppercase tracking-widest transition-colors",
              active
                ? "bg-accent text-on-accent"
                : "text-secondary hover:text-primary",
            ].join(" ")}
          >
            <span aria-hidden="true">{opt.glyph}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
