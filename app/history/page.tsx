import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/app/components/ui/page-shell";
import { formatDate, getHistory, HISTORY_PAGE_SIZE } from "@/lib/account";
import { requireUser } from "@/lib/auth";

import HistoryEntry from "./history-entry";

export const metadata: Metadata = {
  title: "History — Spiritual Oracle",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireUser();

  const parsed = Number(searchParams.page ?? "1");
  const page = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;

  const { rows, total } = await getHistory(user.id, page - 1);
  const pageCount = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  if (rows.length === 0) {
    return (
      <PageShell>
        <PageHeader eyebrow="Your questions" title="History" />
        <div className="rounded-2xl border border-line bg-elevated p-10 text-center">
          <h2 className="font-display text-2xl font-light text-primary">
            Nothing here yet
          </h2>
          <p className="mx-auto mt-3 max-w-sm leading-7 text-secondary">
            Once you ask your first question, it will be kept here along with
            the verse you drew and the reflection that followed.
          </p>
          <Link
            href="/oracle"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            Ask your first question
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Your questions"
        title="History"
        lead={`${total} question${total === 1 ? "" : "s"} so far.`}
      />

      <ul className="space-y-4">
        {rows.map((row) => (
          <HistoryEntry
            key={row.id}
            row={row}
            date={formatDate(row.created_at)}
          />
        ))}
      </ul>

      {pageCount > 1 && (
        <nav
          aria-label="History pages"
          className="mt-10 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={`/history?page=${page - 1}`}
              className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm text-accent transition-colors hover:bg-surface-2"
            >
              Newer
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-muted">
            Page {page} of {pageCount}
          </span>

          {page < pageCount ? (
            <Link
              href={`/history?page=${page + 1}`}
              className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm text-accent transition-colors hover:bg-surface-2"
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </PageShell>
  );
}
