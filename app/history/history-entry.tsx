"use client";

import { useState } from "react";

import type { HistoryRow } from "@/lib/account";

/*
 * One history row. Client-side only for the expand/collapse — the data itself
 * is fetched on the server.
 */
export default function HistoryEntry({
  row,
  date,
}: {
  row: HistoryRow;
  date: string;
}) {
  const [open, setOpen] = useState(false);
  const hasResponse = Boolean(row.generated_takeaway);

  return (
    <li className="rounded-2xl border border-line bg-elevated">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{date}</span>
            {row.source_title && (
              <>
                <span aria-hidden="true">·</span>
                <span>{row.source_title}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>No. {row.user_number}</span>
          </span>
          <span className="mt-2 block leading-7 text-primary">
            {row.user_question}
          </span>
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mt-1 shrink-0 text-accent transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M3.5 6l4.5 4.5L12.5 6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-6 pt-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Reflection
          </p>
          {hasResponse ? (
            <p className="mt-3 leading-7 text-secondary">
              {row.generated_takeaway}
            </p>
          ) : (
            <p className="mt-3 text-sm italic leading-7 text-muted">
              No reflection was saved for this question.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
