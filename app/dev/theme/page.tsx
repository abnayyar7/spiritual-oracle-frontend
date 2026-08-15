import type { Metadata } from "next";

/*
 * Token reference. Renders every semantic token twice — once in a light
 * island, once in a dark one — so both branches of theme.css can be checked
 * side by side without toggling the OS setting.
 *
 * Because [data-theme] is just an attribute, each panel re-resolves the same
 * token names locally; this page is itself the proof that nested theming
 * works, which is what HeroDial relies on to stay dark inside a light page.
 */

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

const TOKENS = [
  "--color-accent-primary",
  "--color-accent-secondary",
  "--color-accent-glow",
  "--color-on-accent",
  "--color-bg-primary",
  "--color-bg-secondary",
  "--color-bg-elevated",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-border",
  "--color-border-strong",
  "--color-success",
  "--color-error",
  "--color-warning",
  "--color-info",
];

function Panel({ theme }: { theme: "light" | "dark" }) {
  return (
    <section
      data-theme={theme}
      className="flex-1 bg-surface p-6 text-primary"
      style={{ minWidth: 320 }}
    >
      <h2 className="mb-1 text-lg font-semibold capitalize">{theme}</h2>
      <p className="mb-5 text-sm text-muted">
        data-theme=&quot;{theme}&quot; — same token names, same file.
      </p>

      <ul className="space-y-2">
        {TOKENS.map((token) => (
          <li key={token} className="flex items-center gap-3">
            <span
              className="h-8 w-8 shrink-0 rounded border border-line"
              style={{ background: `var(${token})` }}
            />
            <code className="text-xs text-secondary">{token}</code>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 text-sm">
        <p className="text-primary">text-primary</p>
        <p className="text-secondary">text-secondary</p>
        <p className="text-muted">text-muted</p>
        <p className="text-accent">text-accent</p>
        <p className="text-ok">text-ok</p>
        <p className="text-danger">text-danger</p>
        <p className="text-caution">text-caution</p>
        <p className="text-note">text-note</p>
      </div>

      <button
        type="button"
        className="mt-5 rounded-full border border-line px-5 py-2 text-sm text-accent"
      >
        border-line + text-accent
      </button>

      {/* Reference sample only — the accent fill is not used in product UI
          yet. It is here so text-on-accent is verifiable, and so Tailwind's
          scanner emits the utility at all. */}
      <div className="mt-3">
        <span className="inline-flex rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent">
          bg-accent + text-on-accent
        </span>
        <p className="mt-2 text-xs text-muted">
          {theme === "dark" ? "9.23:1 — AA + AAA" : "5.96:1 — AA"}
        </p>
      </div>
    </section>
  );
}

export default function ThemeTokens() {
  return (
    <main className="flex min-h-dvh flex-col sm:flex-row">
      <Panel theme="light" />
      <Panel theme="dark" />
    </main>
  );
}
