import type { Metadata } from "next";
import Link from "next/link";

import LogOutButton from "@/app/components/auth/log-out-button";
import {
  Badge,
  Card,
  PageHeader,
  PageShell,
} from "@/app/components/ui/page-shell";
import { getProfile } from "@/lib/account";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account — Spiritual Oracle",
};

/* Matches MAX_FREE_QUERIES in the API settings. */
const FREE_ALLOWANCE = 3;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-primary sm:text-right">{children}</dd>
    </div>
  );
}

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const tier = profile?.subscription_tier ?? "free";
  const isFree = tier === "free";
  const used = profile?.questions_used ?? 0;

  return (
    <PageShell>
      <PageHeader eyebrow="Your account" title="Account" />

      <Card>
        <dl>
          <Row label="Email">{user.email ?? "—"}</Row>
          <Row label="Plan">
            <Badge tone={isFree ? "neutral" : "accent"}>{tier}</Badge>
          </Row>
          <Row label="Questions used this period">
            {isFree ? `${used} of ${FREE_ALLOWANCE}` : `${used}`}
          </Row>
        </dl>

        {!profile && (
          <p className="mt-5 rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm leading-6 text-caution">
            We couldn&apos;t load your subscription details. The figures above
            are defaults, not your real usage.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {isFree && (
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Upgrade
            </Link>
          )}
          <Link
            href="/history"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-6 text-sm text-accent transition-colors hover:bg-surface-2"
          >
            View history
          </Link>
          <LogOutButton />
        </div>
      </Card>
    </PageShell>
  );
}
