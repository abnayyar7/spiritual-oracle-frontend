"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SourceGuidanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSource: (slug: string) => void;
}

const GITA_GUIDANCE = {
  title: "Bhagavad Gita",
  subtext: "Krishna's direct teaching to someone facing a difficult decision.",
  bullets: [
    "Inner conflict or confusion about what's right",
    "Duty vs. desire",
    "Anxiety, overthinking, fear of outcomes",
    "Finding purpose or meaning in work",
    "Letting go of attachment to results",
  ],
  slug: "bhagavad_gita",
};

const RAMCHARITMANAS_GUIDANCE = {
  title: "Ramcharitmanas",
  subtext:
    "An epic of devotion, relationships, and faith through adversity.",
  bullets: [
    "Relationships — family, loyalty, trust",
    "Patience during hardship",
    "Devotion and faith when things feel hopeless",
    "Courage to do what's right",
    "Finding strength through love and service",
  ],
  slug: "ramcharitmanas",
};

export function SourceGuidanceDrawer({
  isOpen,
  onClose,
  onSelectSource,
}: SourceGuidanceDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    // Trap focus within drawer
    const focusableElements = drawerRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement =
      focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen, onClose]);

  const handleSelectSource = (slug: string) => {
    onSelectSource(slug);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed right-0 top-0 z-50 h-full max-h-screen w-full overflow-y-auto bg-elevated transition-transform duration-300 sm:w-1/2 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-elevated px-6 py-4 sm:px-8">
          <h2 id="drawer-title" className="font-display text-2xl font-light text-primary">
            Which text speaks to your question?
          </h2>
          <button
            onClick={onClose}
            aria-label="Close guidance drawer"
            className="rounded-lg p-2 text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8 px-6 py-8 sm:px-8">
          {/* Bhagavad Gita Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl font-medium text-primary">
                {GITA_GUIDANCE.title}
              </h3>
              <p className="mt-1 text-sm text-secondary">
                {GITA_GUIDANCE.subtext}
              </p>
            </div>

            <ul className="space-y-2 pl-4">
              {GITA_GUIDANCE.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="text-sm text-secondary before:mr-3 before:text-accent before:content-['•']"
                >
                  {bullet}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectSource(GITA_GUIDANCE.slug)}
              className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Select Bhagavad Gita
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-line" />

          {/* Ramcharitmanas Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl font-medium text-primary">
                {RAMCHARITMANAS_GUIDANCE.title}
              </h3>
              <p className="mt-1 text-sm text-secondary">
                {RAMCHARITMANAS_GUIDANCE.subtext}
              </p>
            </div>

            <ul className="space-y-2 pl-4">
              {RAMCHARITMANAS_GUIDANCE.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="text-sm text-secondary before:mr-3 before:text-accent before:content-['•']"
                >
                  {bullet}
                </li>
              ))}
            </ul>

            <button
              onClick={() =>
                handleSelectSource(RAMCHARITMANAS_GUIDANCE.slug)
              }
              className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Select Ramcharitmanas
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-line" />

          {/* Footer */}
          <p className="text-xs text-muted">
            Both texts hold wisdom for any question — trust your instinct.
          </p>
        </div>
      </div>
    </>
  );
}
