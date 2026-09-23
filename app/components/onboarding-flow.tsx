"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Info } from "lucide-react";
import { SourceGuidanceDrawer } from "@/app/components/source-guidance-drawer";

type Section = "welcome" | "questions";
type SourceSlug = "bhagavad_gita" | "ramcharitmanas" | "";

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
  const [currentStep, setCurrentStep] = useState<number>(1); // 1-5, controls field visibility
  const [data, setData] = useState<OnboardingData>({
    firstName: "",
    ageRange: "",
    sourceSlug: "", // No default source selected
    question: "",
    number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const maxNumber = data.sourceSlug ? MAX_NUMBERS[data.sourceSlug as keyof typeof MAX_NUMBERS] : 0;
  const numberError =
    data.number && (isNaN(Number(data.number)) || Number(data.number) < 1 || Number(data.number) > maxNumber)
      ? `Number must be between 1 and ${maxNumber}`
      : "";

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
      setCurrentStep(1); // Reset to step 1 when entering questions
    }
  }, [section]);

  const handleBeginClick = () => {
    setSection("questions");
  };

  const handleSourceSelect = (slug: string) => {
    setData({ ...data, sourceSlug: slug as SourceSlug });
    setIsGuidanceOpen(false);
    // Advance to step 4 when source is selected
    if (currentStep === 3) {
      setTimeout(() => setCurrentStep(4), 300);
    }
  };

  const handleNameBlur = () => {
    // Step 1→2: advance only if name has 2+ characters
    if (data.firstName.trim().length >= 2 && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter key on name field advances to step 2 if valid
    if (e.key === "Enter" && data.firstName.trim().length >= 2 && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  };

  const handleAgeSelect = (range: string) => {
    setData({ ...data, ageRange: range });
    // Step 2→3: advance immediately when age is selected
    if (currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 300);
    }
  };

  const handleQuestionBlur = () => {
    // Step 4→5: advance only if question has 10+ characters
    if (data.question.trim().length >= 10 && currentStep === 4) {
      setTimeout(() => setCurrentStep(5), 300);
    }
  };

  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter key on question field advances to step 5 if valid
    if (e.key === "Enter" && data.question.trim().length >= 10 && currentStep === 4) {
      setTimeout(() => setCurrentStep(5), 300);
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!data.firstName.trim() || !data.sourceSlug || !data.question.trim() || !data.number) {
      return;
    }
    if (numberError) {
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
    <>
      <main className="min-h-[calc(100dvh-4rem)] bg-surface px-5 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto w-full max-w-2xl">
          {/* Welcome Section */}
          {section === "welcome" && (
            <div className="relative flex h-[calc(100dvh-8rem)] flex-col items-center justify-center">
              {/* Decorative background: concentric rings in gold */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute h-40 w-40 rounded-full border border-accent/20" />
                <div className="absolute h-56 w-56 rounded-full border border-accent/15" />
                <div className="absolute h-72 w-72 rounded-full border border-accent/10" />
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-8 text-center">
                <div>
                  <h1 className="font-display text-5xl font-light text-primary sm:text-6xl">
                    Welcome to Spiritual Oracle
                  </h1>
                </div>

                {welcomeStep >= 1 && (
                  <div className="animate-fade-in space-y-6">
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
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-medium text-on-accent transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
                    >
                      Let's Begin
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {section === "questions" && (
            <div className="space-y-8">
              {/* Step indicator and progress bar */}
              <div className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted">
                    Step {currentStep} of 5
                  </span>
                  <span className="text-xs text-muted">{Math.round((currentStep / 5) * 100)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Field 1: First Name — visible at step 1+ */}
              {currentStep >= 1 && (
                <div className="animate-fade-in space-y-3 rounded-2xl border border-line bg-elevated p-6 shadow-sm">
                  <label className="block">
                    <span className="text-sm font-medium text-secondary">What should we call you?</span>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={data.firstName}
                      onChange={(e) => setData({ ...data, firstName: e.target.value })}
                      onBlur={handleNameBlur}
                      onKeyDown={handleNameKeyDown}
                      placeholder="Your first name"
                      className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                      autoFocus
                    />
                    {data.firstName.trim().length > 0 && data.firstName.trim().length < 2 && (
                      <p className="mt-2 text-xs text-muted">At least 2 characters</p>
                    )}
                    {data.firstName.trim().length >= 2 && currentStep === 1 && (
                      <p className="mt-2 text-xs text-muted">Press Enter or click away to continue</p>
                    )}
                  </label>
                </div>
              )}

              {/* Field 2: Age Range — visible at step 2+ */}
              {currentStep >= 2 && (
                <div className="animate-fade-in space-y-3 rounded-2xl border border-line bg-elevated p-6 shadow-sm">
                  <label className="block">
                    <span className="text-sm font-medium text-secondary">How old are you?</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {AGE_RANGES.map((range) => (
                        <button
                          key={range}
                          onClick={() => handleAgeSelect(range)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            data.ageRange === range
                              ? "bg-accent text-on-accent shadow-sm"
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

              {/* Field 3: Source Selection — visible at step 3+ */}
              {currentStep >= 3 && (
                <div className="animate-fade-in space-y-3 rounded-2xl border border-line bg-elevated p-6 shadow-sm">
                  <label className="block">
                    <span className="text-sm font-medium text-secondary">
                      Which text speaks to your question?
                    </span>
                    <div className="mt-3 inline-flex rounded-full border border-line-strong bg-surface-2 p-1">
                      {["bhagavad_gita", "ramcharitmanas"].map((slug) => (
                        <button
                          key={slug}
                          onClick={() => handleSourceSelect(slug)}
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
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border-b-2 border-accent px-2 py-1 text-sm font-medium text-accent transition-all hover:bg-accent/5 hover:shadow-sm active:scale-95"
                    >
                      <Info size={16} />
                      Not sure? Learn more
                    </button>
                  </label>
                </div>
              )}

              {/* Field 4: Question — visible at step 4+ */}
              {currentStep >= 4 && (
                <div className="animate-fade-in space-y-3 rounded-2xl border border-line bg-elevated p-6 shadow-sm">
                  <label className="block">
                    <span className="text-sm font-medium text-secondary">What's on your mind today?</span>
                    <textarea
                      ref={questionInputRef}
                      value={data.question}
                      onChange={(e) => setData({ ...data, question: e.target.value })}
                      onBlur={handleQuestionBlur}
                      onKeyDown={handleQuestionKeyDown}
                      placeholder="Share what's on your heart..."
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-muted">
                      Ask about life, purpose, relationships — not predictions or dates.
                    </p>
                    {data.question.trim().length > 0 && data.question.trim().length < 10 && (
                      <p className="mt-2 text-xs text-muted">At least 10 characters</p>
                    )}
                    {data.question.trim().length >= 10 && currentStep === 4 && (
                      <p className="mt-2 text-xs text-muted">Press Enter or click away to continue</p>
                    )}
                  </label>
                </div>
              )}

              {/* Field 5: Number — visible at step 5+ */}
              {currentStep >= 5 && (
                <div className="animate-fade-in space-y-3 rounded-2xl border border-line bg-elevated p-6 shadow-sm">
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
                      className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-primary outline-none transition focus:border-accent"
                      autoFocus
                    />
                    {numberError && <p className="mt-2 text-xs text-caution">{numberError}</p>}
                  </label>
                </div>
              )}

              {/* Submit Button — visible at step 5 when number is valid */}
              {currentStep >= 5 && !numberError && data.number && (
                <div className="animate-fade-in mt-12 space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-on-accent transition-all hover:opacity-90 hover:shadow-lg active:scale-95 disabled:opacity-60"
                  >
                    {isSubmitting ? "Seeking guidance..." : "Seek Guidance →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

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
    </>
  );
}

// Hide header during onboarding using a route-specific approach
// This is handled by checking the page in the Header component instead
