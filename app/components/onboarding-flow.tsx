"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SourceGuidanceDrawer } from "@/app/components/source-guidance-drawer";

type Section = "welcome" | "questions";
type SourceSlug = "bhagavad_gita" | "ramcharitmanas";

interface OnboardingData {
  firstName: string;
  ageRange: string;
  sourceSlug: SourceSlug;
  question: string;
  number: string;
}

const AGE_RANGES = ["Under 20", "20-30", "30-45", "45-60", "60+", "Skip"];
const MAX_NUMBERS = {
  bhagavad_gita: 701,
  ramcharitmanas: 1074,
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("welcome");
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    ageRange: "",
    sourceSlug: "bhagavad_gita",
    question: "",
    number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState<number>(0);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  const maxNumber = MAX_NUMBERS[data.sourceSlug];
  const numberError =
    data.number && (isNaN(Number(data.number)) || Number(data.number) < 1 || Number(data.number) > maxNumber)
      ? `Number must be between 1 and ${maxNumber}`
      : "";

  const isField1Complete = data.firstName.trim().length > 0;
  const isField2Complete = true; // Optional field
  const isField3Complete = data.sourceSlug.length > 0;
  const isField4Complete = data.question.trim().length > 0;
  const isField5Complete = !numberError && data.number.length > 0;

  useEffect(() => {
    if (section === "welcome") {
      const timer1 = setTimeout(() => setWelcomeStep(1), 300);
      const timer2 = setTimeout(() => setWelcomeStep(2), 1200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [section]);

  useEffect(() => {
    if (section === "questions") {
      setVisibleFields(1);

      const timers: NodeJS.Timeout[] = [];

      if (isField1Complete) {
        timers.push(setTimeout(() => setVisibleFields(2), 500));
      }

      if (isField1Complete && isField2Complete) {
        timers.push(setTimeout(() => setVisibleFields(3), 1000));
      }

      if (isField1Complete && isField2Complete && isField3Complete) {
        timers.push(setTimeout(() => setVisibleFields(4), 1500));
      }

      if (isField1Complete && isField2Complete && isField3Complete && isField4Complete) {
        timers.push(setTimeout(() => setVisibleFields(5), 2000));
      }

      return () => timers.forEach(clearTimeout);
    }
  }, [section, isField1Complete, isField2Complete, isField3Complete, isField4Complete]);

  const handleBeginClick = () => {
    setSection("questions");
  };

  const handleSourceSelect = (slug: string) => {
    setData({ ...data, sourceSlug: slug as SourceSlug });
    setIsGuidanceOpen(false);
  };

  const handleSubmit = async () => {
    if (!isField1Complete || !isField3Complete || !isField4Complete || !isField5Complete) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save profile
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.firstName,
          age_range: data.ageRange || null,
          onboarding_complete: true,
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Failed to save profile");
      }

      // Redirect to oracle with pre-filled data
      const params = new URLSearchParams({
        source: data.sourceSlug,
        question: data.question,
        number: data.number,
      });

      router.push(`/oracle?${params.toString()}`);
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-surface px-5 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-2xl">
        {/* Welcome Section */}
        {section === "welcome" && (
          <div className="space-y-8">
            <div className="mb-12 text-center">
              <h1 className="font-display text-5xl font-light text-primary sm:text-6xl">
                Welcome to Spiritual Oracle
              </h1>
            </div>

            {welcomeStep >= 1 && (
              <div className="animate-fade-in space-y-6 text-center">
                <p className="text-lg text-secondary leading-relaxed">
                  For centuries, seekers have opened sacred texts at random to find guidance.
                  <br />
                  Now it's your turn.
                </p>
              </div>
            )}

            {welcomeStep >= 2 && (
              <div className="animate-fade-in mt-12 flex justify-center">
                <button
                  onClick={handleBeginClick}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
                >
                  Let's Begin
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Questions Section */}
        {section === "questions" && (
          <div className="space-y-8">
            {/* Field 1: First Name */}
            {visibleFields >= 1 && (
              <div className="animate-fade-in space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-secondary">What should we call you?</span>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    placeholder="Your first name"
                    className="mt-2 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                    autoFocus
                  />
                </label>
              </div>
            )}

            {/* Field 2: Age Range */}
            {visibleFields >= 2 && (
              <div className="animate-fade-in space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-secondary">How old are you?</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {AGE_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => setData({ ...data, ageRange: range })}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          data.ageRange === range
                            ? "bg-accent text-on-accent"
                            : "border border-line text-secondary hover:border-accent hover:text-primary"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            )}

            {/* Field 3: Source Selection */}
            {visibleFields >= 3 && (
              <div className="animate-fade-in space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-secondary">
                    Which text speaks to your question?
                  </span>
                  <div className="mt-3 inline-flex rounded-full border border-line-strong bg-surface-2 p-1">
                    {["bhagavad_gita", "ramcharitmanas"].map((slug) => (
                      <button
                        key={slug}
                        onClick={() => setData({ ...data, sourceSlug: slug as SourceSlug })}
                        className={`h-9 rounded-full px-5 text-sm font-medium transition-colors ${
                          data.sourceSlug === slug
                            ? "bg-accent text-on-accent"
                            : "text-secondary hover:text-primary"
                        }`}
                      >
                        {slug === "bhagavad_gita" ? "Bhagavad Gita" : "Ramcharitmanas"}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuidanceOpen(true)}
                    className="mt-2 text-xs text-secondary transition-colors hover:text-accent"
                  >
                    Not sure? Learn more →
                  </button>
                </label>
              </div>
            )}

            {/* Field 4: Question */}
            {visibleFields >= 4 && (
              <div className="animate-fade-in space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-secondary">What's on your mind today?</span>
                  <textarea
                    ref={questionInputRef}
                    value={data.question}
                    onChange={(e) => setData({ ...data, question: e.target.value })}
                    placeholder="Share what's on your heart..."
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                  />
                  <p className="mt-2 text-xs text-muted">
                    Ask about life, purpose, relationships — not predictions or dates.
                  </p>
                </label>
              </div>
            )}

            {/* Field 5: Number */}
            {visibleFields >= 5 && (
              <div className="animate-fade-in space-y-2">
                <label className="block">
                  <span className="text-sm font-medium text-secondary">
                    Close your eyes. Take a breath. Think of a number between 1 and {maxNumber}.
                  </span>
                  <input
                    ref={numberInputRef}
                    type="number"
                    value={data.number}
                    onChange={(e) => setData({ ...data, number: e.target.value })}
                    min={1}
                    max={maxNumber}
                    placeholder="Your number"
                    className="mt-2 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                  />
                  {numberError && <p className="mt-1 text-xs text-caution">{numberError}</p>}
                </label>
              </div>
            )}

            {/* Submit Button */}
            {visibleFields >= 5 && !numberError && data.number && (
              <div className="animate-fade-in">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? "Seeking guidance..." : "Seek Guidance →"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <SourceGuidanceDrawer
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
        onSelectSource={handleSourceSelect}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
