import type { Metadata } from "next";
import Link from "next/link";

import { Card, PageHeader, PageShell } from "@/app/components/ui/page-shell";
import { requireUser } from "@/lib/auth";

import ThemeChoice from "./theme-choice";

export const metadata: Metadata = {
  title: "Settings — Spiritual Oracle",
};

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <PageShell>
      <PageHeader eyebrow="Preferences" title="Settings" />

      <Card>
        <SettingRow
          title="Theme"
          description="Applies immediately and is remembered on this device."
        >
          <ThemeChoice />
        </SettingRow>

        <SettingRow
          title="Email"
          description="Changing your email address isn't available yet."
        >
          <span className="text-sm text-secondary">{user.email ?? "—"}</span>
        </SettingRow>

        <SettingRow
          title="Password"
          description="Send yourself a reset link to choose a new one."
        >
          <Link
            href="/forgot-password"
            className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm text-accent transition-colors hover:bg-surface-2"
          >
            Reset password
          </Link>
        </SettingRow>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-xl font-light text-primary">
          Coming soon
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <li>Notification preferences — a daily or weekly verse by email.</li>
          <li>Default source, so you don&apos;t pick one every time.</li>
          <li>Export your question history.</li>
          <li>Delete your account and all associated data.</li>
        </ul>
        <p className="mt-5 text-sm leading-6 text-secondary">
          Want one of these sooner?{" "}
          <Link
            href="/contact"
            className="text-accent underline-offset-4 hover:underline"
          >
            Tell us
          </Link>
          .
        </p>
      </Card>
    </PageShell>
  );
}
