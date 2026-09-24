"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SourceGuidanceDrawer } from "@/app/components/source-guidance-drawer";


// Only used until GET /sources responds, and as a floor if it fails. The
// backend performs the real, authoritative range check regardless.
const FALLBACK_SOURCES: Source[] = [
  { id: 2, slug: "bhagavad_gita", title: "Bhagavad Gita", total_units: 701 },
];

type Source = {
  id: number;
  slug: string;
  title: string;
  total_units: number;
};

type OracleResponse = {
  answer?: string;
  takeaway?: string;
  generated_takeaway?: string;
  original_text?: string;
  // null when the entry has no English translation yet
  selected_translation?: string | null;
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
  hasTranslation: boolean;
  chapterNumber?: number;
  verseNumber?: number;
  answer: string;
};

function normalizeResponse(response: OracleResponse): Result {
  const translation = response.selected_translation ?? "";

  return {
    originalText: response.original_text ?? response.entry?.original_text ?? "",
    translation,
    hasTranslation: translation.trim().length > 0,
    chapterNumber: response.chapter_number ?? response.entry?.chapter_number,
    verseNumber: response.verse_number ?? response.entry?.verse_number,
    answer: response.answer ?? response.takeaway ?? response.generated_takeaway ?? "",
  };
}

function getNumberError(rawNumber: string, maxNumber: number): string {
  if (!rawNumber.trim()) {
    return "";
  }

  const parsed = Number(rawNumber);

  if (!Number.isInteger(parsed)) {
    return "Oracle number must be a whole number.";
  }

  if (parsed < 1 || parsed > maxNumber) {
    return `Oracle number must be between 1 and ${maxNumber}.`;
  }

  return "";
}

export default function OracleForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [sources, setSources] = useState<Source[]>(FALLBACK_SOURCES);
  const [activeSlug, setActiveSlug] = useState("");
  const [question, setQuestion] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [paramsProcessed, setParamsProcessed] = useState(false);

  const activeSource = sources.find((source) => source.slug === activeSlug);
  const maxNumber = activeSource?.total_units ?? 1;

  const numberError = getNumberError(number, maxNumber);
  const isSubmitDisabled =
    isLoading || !question || !number || !activeSlug || Boolean(numberError);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      return;
    }

    let cancelled = false;

    async function loadSources() {
      try {
        const response = await fetch(
          `${apiUrl!.replace(/\/$/, "")}/sources`,
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Source[];

        if (cancelled || !Array.isArray(data) || data.length === 0) {
          return;
        }

        setSources(data);
      } catch {
        // Non-fatal: the fallback source keeps the form usable.
      }
    }

    void loadSources();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paramsProcessed) return;

    const source = searchParams.get("source");
    const questionParam = searchParams.get("question");
    const numberParam = searchParams.get("number");

    if (source && questionParam && numberParam) {
      setParamsProcessed(true);
      setActiveSlug(source);
      setQuestion(questionParam);
      setNumber(numberParam);

      // Clear URL params after processing
      window.history.replaceState({}, document.title, "/oracle");
    }
  }, [searchParams, paramsProcessed]);

  useEffect(() => {
    if (!paramsProcessed || hasAutoSubmitted || !formRef.current) return;

    // Auto-submit form when all params from onboarding are present
    const source = searchParams.get("source");
    const questionParam = searchParams.get("question");
    const numberParam = searchParams.get("number");

    if (source && questionParam && numberParam && question && number && activeSlug) {
      setHasAutoSubmitted(true);
      // Trigger form submission after a small delay to ensure state is updated
      setTimeout(() => {
        formRef.current?.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }, 100);
    }
  }, [paramsProcessed, question, number, activeSlug, searchParams, hasAutoSubmitted]);

  const selectSource = useCallback(
    (slug: string, shouldFocusInput: boolean = false) => {
      // Switching source invalidates everything tied to the old one.
      setActiveSlug(slug);
      setSourceError(""); // Clear source error when source is selected
      setQuestion("");
      setNumber("");
      setResult(null);
      setError("");

      // Focus question input if called from the guidance drawer
      if (shouldFocusInput) {
        setTimeout(() => {
          questionInputRef.current?.focus();
        }, 0);
      }
    },
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    // Validate source selection
    if (!activeSlug) {
      setSourceError("Please select a text first");
      return;
    }

    // Defense in depth: re-validate here too, in case the disabled state on
    // the submit button was bypassed (e.g. via DOM manipulation in devtools).
    // The backend performs the real, authoritative range check regardless.
    const currentNumberError = getNumberError(number, maxNumber);
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
          source_slug: activeSlug,
        }),
      });

      if (response.status === 403 || response.status === 402) {
        setError("You've used your 3 free questions. Upgrade to continue.");
        return;
      }

      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as
          | { detail?: string }
          | null;
        setError(
          data?.detail ?? `Oracle number must be between 1 and ${maxNumber}.`,
        );
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
    <main className="min-h-[calc(100dvh-4rem)] bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Spiritual Oracle
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-primary sm:text-5xl">
            Ask your question
          </h1>
        </div>

        <div className="mb-6 space-y-3">
          <div
            role="tablist"
            aria-label="Choose a source"
            className="inline-flex rounded-full border border-line-strong bg-surface-2 p-1"
          >
            {sources.map((source) => {
              const isActive = source.slug === activeSlug;

              return (
                <button
                  key={source.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectSource(source.slug)}
                  className={`h-9 rounded-full px-5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-on-accent"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {source.title}
                </button>
              );
            })}
          </div>

          {sourceError && (
            <p className="text-sm text-danger">{sourceError}</p>
          )}

          <button
            type="button"
            onClick={() => setIsGuidanceOpen(true)}
            className="text-sm text-accent transition-all hover:underline"
          >
            Not sure? Learn more →
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-line bg-elevated p-6 shadow-sm sm:p-8"
        >
          <label className="block">
            <span className="text-sm font-medium text-secondary">
              Your question
            </span>
            <textarea
              ref={questionInputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
              rows={5}
              className="mt-2 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
            />
            <p className="mt-2 text-xs text-muted">
              Ask about life, purpose, relationships — not predictions or dates.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-secondary">
              Oracle number
            </span>
            <input
              type="number"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              required
              min={1}
              max={maxNumber}
              aria-invalid={Boolean(numberError)}
              className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-primary outline-none transition focus:border-accent aria-[invalid=true]:border-danger"
            />
            {numberError ? (
              <p className="mt-2 text-sm text-danger">{numberError}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Enter a number between 1 and {maxNumber}.
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-4 text-sm font-medium tracking-wide text-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Asking..." : "Ask Oracle"}
          </button>
        </form>

        {error ? (
          <p className="mt-6 rounded-xl border border-line-strong bg-surface-2 px-4 py-3 text-sm text-caution">
            {error}
          </p>
        ) : null}

        {result ? (
          <article className="mt-8 space-y-5 rounded-2xl border border-line bg-elevated p-6 shadow-sm sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Chapter {result.chapterNumber ?? "-"}, Verse{" "}
              {result.verseNumber ?? "-"}
            </p>
            <p className="font-deva text-xl leading-[2.1] text-primary sm:text-2xl">
              {result.originalText}
            </p>
            {result.hasTranslation ? (
              <p className="leading-7 text-secondary">{result.translation}</p>
            ) : (
              <p className="text-sm italic leading-7 text-muted">
                English translation not yet available for this verse
              </p>
            )}
            <div className="border-t border-line pt-5">
              <h2 className="text-xs uppercase tracking-[0.18em] text-accent">
                Answer
              </h2>
              <p className="mt-3 leading-7 text-primary">{result.answer}</p>
            </div>
          </article>
        ) : null}
      </section>

      <SourceGuidanceDrawer
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
        onSelectSource={(slug) => {
          selectSource(slug, true);
        }}
      />
    </main>
  );
}
