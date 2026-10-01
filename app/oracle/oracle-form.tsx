"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SourceGuidanceDrawer } from "@/app/components/source-guidance-drawer";
import { SituationCard } from "@/app/components/situation-card";
import { cleanVerseText } from "@/lib/verse-utils";
import {
  SITUATIONS,
  SOURCE_INFO,
  matchSourceFromKeywords,
  type SourceSlug,
} from "@/app/lib/oracle-situations";

type Tab = "guided" | "choose";

const FALLBACK_SOURCES: Source[] = [
  { id: 2, slug: "bhagavad_gita", title: "Bhagavad Gita", total_units: 701 },
  { id: 3, slug: "ramcharitmanas", title: "Ramcharitmanas", total_units: 1074 },
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
  const [activeTab, setActiveTab] = useState<Tab>("guided");
  const [selectedSituation, setSelectedSituation] = useState<number | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [question, setQuestion] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [showSomethingElse, setShowSomethingElse] = useState(false);
  const [somethingElseInput, setSomethingElseInput] = useState("");
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [paramsProcessed, setParamsProcessed] = useState(false);
  const [showRestartChoice, setShowRestartChoice] = useState(false);

  const activeSource = sources.find((source) => source.slug === activeSlug);
  const maxNumber = activeSource?.total_units ?? 1;

  const numberError = getNumberError(number, maxNumber);
  const isSubmitDisabled =
    isLoading || !question || !number || !activeSlug || Boolean(numberError);

  const getSourceLabel = (slug: SourceSlug) => {
    const info = SOURCE_INFO[slug];
    return `Drawing from the ${info.title}`;
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedSituation(null);
    setActiveSlug("");
    setQuestion("");
    setNumber("");
    setShowSomethingElse(false);
    setSomethingElseInput("");
    setSourceError("");
  };

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
      console.log("📋 [Oracle] Params detected from onboarding:", {
        source,
        question: questionParam,
        number: numberParam,
      });
      setParamsProcessed(true);
      setActiveSlug(source);
      setQuestion(questionParam);
      setNumber(numberParam);

      // Clear URL params so page refresh doesn't re-submit
      console.log("🗑️ [Oracle] Clearing URL params");
      window.history.replaceState({}, document.title, "/oracle");
    }
  }, [searchParams, paramsProcessed]);

  useEffect(() => {
    if (!paramsProcessed || hasAutoSubmitted || !formRef.current) return;

    // Auto-submit form when all params from onboarding are present
    // Check state values (not searchParams) since we already set them in previous effect
    if (question && number && activeSlug) {
      console.log("✅ [Oracle] Auto-submitting with pre-filled form:", {
        activeSlug,
        question,
        number,
      });
      setHasAutoSubmitted(true);

      // Wait for state to fully settle and render before submitting
      setTimeout(() => {
        formRef.current?.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }, 500);
    }
  }, [paramsProcessed, question, number, activeSlug, hasAutoSubmitted]);

  const selectSituation = useCallback((situationId: number) => {
    const situation = SITUATIONS.find((s) => s.id === situationId);
    if (!situation) return;

    setSelectedSituation(situationId);
    setActiveSlug(situation.source);
    setSourceError("");
    setQuestion("");
    setNumber("");
    setResult(null);
    setError("");
    setShowSomethingElse(false);
    setSomethingElseInput("");
  }, []);

  const collapseSituation = useCallback(() => {
    setSelectedSituation(null);
  }, []);

  const handleAskAnotherQuestion = () => {
    setShowRestartChoice(true);
  };

  const handleSameTopicAgain = () => {
    // Keep source/situation, clear question/number/result
    setQuestion("");
    setNumber("");
    setResult(null);
    setError("");
    setShowRestartChoice(false);

    // Scroll to question textarea
    setTimeout(() => {
      questionInputRef.current?.focus();
      questionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleNewTopic = () => {
    // Full reset
    setActiveTab("guided");
    setSelectedSituation(null);
    setActiveSlug("");
    setQuestion("");
    setNumber("");
    setResult(null);
    setError("");
    setSourceError("");
    setShowSomethingElse(false);
    setSomethingElseInput("");
    setShowRestartChoice(false);

    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show brief confirmation
      const button = event?.target as HTMLButtonElement;
      if (button) {
        const original = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = original;
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const selectSourceDirect = useCallback((slug: string, shouldFocusInput: boolean = false) => {
    if (slug === "") {
      // Clear selection - go back to pills
      setActiveSlug("");
      setQuestion("");
      setNumber("");
      setError("");
    } else {
      // Set new source
      setActiveSlug(slug);
      setSelectedSituation(null);
      setSourceError("");
      setQuestion("");
      setNumber("");
      setResult(null);
      setError("");
      setShowSomethingElse(false);

      if (shouldFocusInput) {
        setTimeout(() => {
          questionInputRef.current?.focus();
        }, 0);
      }
    }
  }, []);

  const handleSomethingElseContinue = () => {
    if (!somethingElseInput.trim()) return;

    const matched = matchSourceFromKeywords(somethingElseInput);
    setActiveSlug(matched);
    setQuestion(somethingElseInput);
    setSelectedSituation(null);
    setShowSomethingElse(false);
    setTimeout(() => {
      questionInputRef.current?.focus();
    }, 0);
  };

  const toggleSource = () => {
    if (!activeSlug) return;
    const newSlug = activeSlug === "bhagavad_gita" ? "ramcharitmanas" : "bhagavad_gita";
    setActiveSlug(newSlug);
    setQuestion(somethingElseInput);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    console.log("🚀 [Oracle] Form submission triggered:", {
      activeSlug,
      question,
      number,
    });

    if (!activeSlug) {
      console.log("❌ [Oracle] No source selected");
      setSourceError("Please select a situation or text first");
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

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-line">
          <button
            type="button"
            onClick={() => handleTabChange("guided")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "guided"
                ? "border-b-2 border-accent text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            Guided
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("choose")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "choose"
                ? "border-b-2 border-accent text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            Choose Text
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "guided" && (
            <motion.div
              key="guided"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 space-y-6"
            >
              <AnimatePresence mode="wait">
                {!activeSlug && !selectedSituation && !showSomethingElse ? (
                  // Grid view - all 12 cards + "something else"
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-semibold text-primary">
                      What guidance are you seeking?
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {SITUATIONS.map((situation) => (
                        <SituationCard
                          key={situation.id}
                          situation={situation}
                          isSelected={false}
                          onClick={() => selectSituation(situation.id)}
                        />
                      ))}
                    </div>
                    <SituationCard
                      situation={{
                        id: 0,
                        label: "Something else",
                        source: "bhagavad_gita",
                      }}
                      isSelected={false}
                      isSpecial={true}
                      onClick={() => {
                        setShowSomethingElse(true);
                        setSelectedSituation(null);
                      }}
                    />
                  </motion.div>
                ) : showSomethingElse ? (
                  // Something else input flow (only show when actively in this flow)
                  <motion.div
                    key="something-else-input"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border border-line bg-elevated p-4"
                  >
                    <label className="block space-y-3">
                      <span className="text-sm font-medium text-secondary">
                        Describe what&apos;s on your mind in a few words
                      </span>
                      <input
                        type="text"
                        value={somethingElseInput}
                        onChange={(e) => setSomethingElseInput(e.target.value)}
                        placeholder="e.g., my mother is unwell"
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-primary outline-none transition focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={handleSomethingElseContinue}
                        disabled={!somethingElseInput.trim()}
                        className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        Continue →
                      </button>
                    </label>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 space-y-6"
            >
              <AnimatePresence mode="wait">
                {!activeSlug ? (
                  // Pills view
                  <motion.div
                    key="pills"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      {sources.map((source) => {
                        const info = SOURCE_INFO[source.slug as SourceSlug];

                        return (
                          <button
                            key={source.slug}
                            type="button"
                            onClick={() => selectSourceDirect(source.slug)}
                            style={{
                              border: "1px solid #6B7280",
                              backgroundColor: "transparent",
                              color: "#C9BFA8",
                              borderRadius: "12px",
                              padding: "16px",
                              fontSize: "14px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 200ms",
                              textAlign: "left",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#D4AF37";
                              e.currentTarget.style.color = "#E5DDD0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#6B7280";
                              e.currentTarget.style.color = "#C9BFA8";
                            }}
                          >
                            <div className="font-medium">{info.title}</div>
                            <div className="text-xs opacity-75">{info.subtitle}</div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGuidanceOpen(true)}
                      className="text-sm text-accent transition-all hover:underline"
                    >
                      Not sure? Learn more →
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {sourceError && (
          <p className="mb-4 text-sm text-danger">{sourceError}</p>
        )}

        {/* Unified compact bar section - shows situation + source */}
        <AnimatePresence mode="wait">
          {activeSlug && (
            <motion.div
              key="compact-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {!result ? (
                // Before answer: situation + source with Change button
                <div className="mb-8 rounded-lg border border-line bg-elevated p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Line 1: Situation or user input */}
                      {selectedSituation ? (
                        <p className="text-sm font-medium text-primary">
                          {SITUATIONS.find(s => s.id === selectedSituation)?.label}
                        </p>
                      ) : showSomethingElse && somethingElseInput ? (
                        <p className="truncate text-sm font-medium text-primary">
                          {somethingElseInput}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-primary">
                          Drawing from {SOURCE_INFO[activeSlug as SourceSlug]?.title}
                        </p>
                      )}

                      {/* Line 2/inline: Source in muted + gold */}
                      {selectedSituation || showSomethingElse ? (
                        <p className="mt-1 text-xs text-muted sm:mt-0">
                          <span className="hidden sm:inline">· </span>
                          Drawing from{" "}
                          <span style={{ color: "#D4AF37" }}>
                            {SOURCE_INFO[activeSlug as SourceSlug]?.title}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    {/* Change button */}
                    {selectedSituation || showSomethingElse ? (
                      <button
                        type="button"
                        onClick={selectedSituation ? collapseSituation : () => setShowSomethingElse(false)}
                        className="whitespace-nowrap text-sm text-accent transition-colors hover:underline"
                      >
                        Change
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                // After answer: situation + source, locked, no Change button
                <div className="mb-8 space-y-3">
                  <div className="rounded-lg border border-line bg-elevated p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Line 1: ✓ Situation */}
                        {selectedSituation ? (
                          <p className="text-sm font-medium text-primary">
                            ✓ {SITUATIONS.find(s => s.id === selectedSituation)?.label}
                          </p>
                        ) : showSomethingElse && somethingElseInput ? (
                          <p className="truncate text-sm font-medium text-primary">
                            ✓ {somethingElseInput}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-primary">
                            ✓ Answered from {SOURCE_INFO[activeSlug as SourceSlug]?.title}
                          </p>
                        )}

                        {/* Line 2/inline: Source in muted + gold */}
                        {selectedSituation || showSomethingElse ? (
                          <p className="mt-1 text-xs text-muted sm:mt-0">
                            <span className="hidden sm:inline">· </span>
                            Answered from{" "}
                            <span style={{ color: "#D4AF37" }}>
                              {SOURCE_INFO[activeSlug as SourceSlug]?.title}
                            </span>
                          </p>
                        ) : null}
                      </div>

                      {/* Ask Another Question button */}
                      <button
                        type="button"
                        onClick={handleAskAnotherQuestion}
                        className="whitespace-nowrap text-sm text-accent transition-colors hover:underline"
                      >
                        Ask Another →
                      </button>
                    </div>
                  </div>

                  {/* "Same topic?" choice */}
                  <AnimatePresence>
                    {showRestartChoice && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-line bg-elevated p-4"
                      >
                        <p className="mb-3 text-sm font-medium text-secondary">Same topic?</p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleSameTopicAgain}
                            className="flex-1 rounded-lg border border-accent px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-on-accent"
                          >
                            Yes, ask again
                          </button>
                          <button
                            type="button"
                            onClick={handleNewTopic}
                            className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
                          >
                            New topic
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form only visible after source selection, hidden when result shown */}
        <AnimatePresence>
          {activeSlug && !result && (
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
            </motion.form>
          )}

          {activeSlug && result && (
            // Post-answer locked form
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 rounded-2xl border border-line bg-elevated p-6 shadow-sm sm:p-8"
            >
              <label className="block">
                <span className="text-sm font-medium text-secondary">
                  Your question
                </span>
                <div className="relative mt-2">
                  <textarea
                    ref={questionInputRef}
                    value={question}
                    readOnly
                    rows={5}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none opacity-75 transition"
                  />
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(question)}
                    className="absolute right-3 top-3 rounded-lg bg-surface p-2 text-muted transition-colors hover:text-accent"
                    title="Copy question"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-secondary">
                  Oracle number
                </span>
                <input
                  type="number"
                  value={number}
                  readOnly
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-primary outline-none opacity-75 transition"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

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
              <p className="leading-7 text-secondary">{cleanVerseText(result.translation)}</p>
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
          selectSourceDirect(slug, true);
        }}
      />
    </main>
  );
}
