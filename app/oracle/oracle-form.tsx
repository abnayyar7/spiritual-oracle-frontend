"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Must match the `bhagavad_gita` source's total_units in the backend DB.
// The backend is the authoritative check — this only drives the UI.
const MAX_ORACLE_NUMBER = 701;

type OracleResponse = {
  answer?: string;
  takeaway?: string;
  generated_takeaway?: string;
  original_text?: string;
  selected_translation?: string;
  selected_translation_author?: string | null;
  chapter_number?: number;
  verse_number?: number;
  entry?: {
    original_text?: string;
    chapter_number?: number;
    verse_number?: number;
  };
};

type Result = {
  originalText: string;
  translation: string;
  chapterNumber?: number;
  verseNumber?: number;
  answer: string;
};

function getTranslation(response: OracleResponse) {
  return response.selected_translation || response.entry?.original_text || "";
}

function normalizeResponse(response: OracleResponse): Result {
  return {
    originalText: response.original_text ?? response.entry?.original_text ?? "",
    translation: getTranslation(response),
    chapterNumber: response.chapter_number ?? response.entry?.chapter_number,
    verseNumber: response.verse_number ?? response.entry?.verse_number,
    answer: response.answer ?? response.takeaway ?? response.generated_takeaway ?? "",
  };
}

function getNumberError(rawNumber: string): string {
  if (!rawNumber.trim()) {
    return "";
  }

  const parsed = Number(rawNumber);

  if (!Number.isInteger(parsed)) {
    return "Oracle number must be a whole number.";
  }

  if (parsed < 1 || parsed > MAX_ORACLE_NUMBER) {
    return `Oracle number must be between 1 and ${MAX_ORACLE_NUMBER}.`;
  }

  return "";
}

export default function OracleForm() {
  const supabase = createClient();
  const [question, setQuestion] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const numberError = getNumberError(number);
  const isSubmitDisabled = isLoading || !question || !number || Boolean(numberError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    // Defense in depth: re-validate here too, in case the disabled state on
    // the submit button was bypassed (e.g. via DOM manipulation in devtools).
    // The backend performs the real, authoritative range check regardless.
    const currentNumberError = getNumberError(number);
    if (currentNumberError) {
      setError(currentNumberError);
      return;
    }

    setIsLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setIsLoading(false);
      setError("Please sign in again before asking your question.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setIsLoading(false);
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question,
          number: Number(number),
          source_slug: "bhagavad_gita",
        }),
      });

      if (response.status === 403 || response.status === 402) {
        setError("You've used your 3 free questions. Upgrade to continue.");
        return;
      }

      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { detail?: string } | null;
        setError(data?.detail ?? `Oracle number must be between 1 and ${MAX_ORACLE_NUMBER}.`);
        return;
      }

      if (!response.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const data = (await response.json()) as OracleResponse;
      setResult(normalizeResponse(data));
    } catch {
      setError("Could not reach the oracle API. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Spiritual Oracle
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-950">
            Ask your question
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Your question
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
              rows={5}
              className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-stone-950 outline-none transition focus:border-stone-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Oracle number
            </span>
            <input
              type="number"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              required
              min={1}
              max={MAX_ORACLE_NUMBER}
              aria-invalid={Boolean(numberError)}
              className="mt-2 h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950 outline-none transition focus:border-stone-950 aria-[invalid=true]:border-amber-400"
            />
            {numberError ? (
              <p className="mt-2 text-sm text-amber-700">{numberError}</p>
            ) : (
              <p className="mt-2 text-sm text-stone-500">
                Enter a number between 1 and {MAX_ORACLE_NUMBER}.
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex h-11 w-full items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Asking..." : "Ask Oracle"}
          </button>
        </form>

        {error ? (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </p>
        ) : null}

        {result ? (
          <article className="mt-8 space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-500">
              Chapter {result.chapterNumber ?? "-"}, Verse{" "}
              {result.verseNumber ?? "-"}
            </p>
            <p className="text-2xl leading-10 text-stone-950">
              {result.originalText}
            </p>
            <p className="leading-7 text-stone-700">{result.translation}</p>
            <div className="border-t border-stone-200 pt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Answer
              </h2>
              <p className="mt-3 leading-7 text-stone-800">{result.answer}</p>
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
