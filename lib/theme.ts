"use client";

/*
 * Shared theme state.
 *
 * There are now two controls for the same setting — the header toggle and the
 * one on /settings. Each holding its own useState would let them drift: click
 * one and the other keeps rendering the old label until it remounts. A custom
 * event on window is the smallest thing that keeps every mounted control in
 * step without pulling in a context provider.
 *
 * The DOM attribute is the source of truth; localStorage only persists it, and
 * the inline script in layout.tsx applies it before first paint.
 */

export type Theme = "dark" | "light";

const EVENT = "spiritual-oracle:themechange";
const STORAGE_KEY = "theme";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function setTheme(next: Theme): void {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode / storage disabled — the change still applies this session.
  }
  window.dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: next }));
}

export function onThemeChange(cb: (t: Theme) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Theme>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
