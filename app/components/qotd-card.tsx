"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface QOTDCardProps {
  date: string;
  original_text: string;
  reflection_text: string;
  chapter_verse?: string;
  source_title?: string;
}

export function QOTDCard({
  date,
  original_text,
  reflection_text,
  chapter_verse = "Bhagavad Gita",
  source_title = "Gita",
}: QOTDCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handleShareText = async () => {
    const text = `${reflection_text}\n\n— Spiritual Oracle`;
    const url = typeof window !== "undefined" ? window.location.origin : "";

    if (navigator.share && navigator.canShare({ text })) {
      try {
        await navigator.share({
          title: `Quote of the Day — ${date}`,
          text,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
          fallbackCopyToClipboard(text);
        }
      }
    } else {
      fallbackCopyToClipboard(text);
    }
    setShowShareMenu(false);
  };

  const handleShareImage = async () => {
    setImageLoading(true);
    try {
      const params = new URLSearchParams({
        date,
        original: original_text,
        reflection: reflection_text,
      });

      const imageUrl = `/api/qotd/share-image?${params}`;

      if (navigator.share && navigator.canShare({ files: [] })) {
        // Mobile share with image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `qotd-${date}.png`, {
          type: "image/png",
        });

        try {
          await navigator.share({
            title: `Quote of the Day — ${date}`,
            text: reflection_text,
            files: [file],
          });
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Share failed:", err);
            window.open(imageUrl, "_blank");
          }
        }
      } else {
        // Desktop: open image in new tab or download
        window.open(imageUrl, "_blank");
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setImageLoading(false);
      setShowShareMenu(false);
    }
  };

  const fallbackCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Container */}
      <div className="relative bg-elevated rounded-lg border border-line p-8 shadow-lg">
        {/* Share Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 text-secondary hover:text-accent transition-colors"
            aria-label="Share"
            title="Share this quote"
          >
            <Share2 size={20} />
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute top-12 right-0 bg-elevated border border-line rounded-lg shadow-xl z-50 min-w-max">
              <button
                onClick={handleShareText}
                className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-surface-2 transition-colors first:rounded-t-lg"
              >
                {copied ? (
                  <div className="flex items-center gap-2">
                    <Check size={16} />
                    Copied!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Copy size={16} />
                    Share as text
                  </div>
                )}
              </button>
              <button
                onClick={handleShareImage}
                disabled={imageLoading}
                className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-surface-2 transition-colors disabled:opacity-50 last:rounded-b-lg"
              >
                <div className="flex items-center gap-2">
                  <Share2 size={16} />
                  {imageLoading ? "Generating..." : "Share as image"}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Verse */}
        <div className="text-center mb-8">
          <p className="font-deva text-2xl text-primary leading-relaxed">
            {original_text}
          </p>
          <p className="text-xs text-muted mt-3">{source_title}</p>
        </div>

        {/* Gold Divider */}
        <div className="h-px bg-accent mb-8 mx-auto w-16" />

        {/* Reflection */}
        <div className="text-center mb-8">
          <p className="font-display text-xl text-primary leading-relaxed">
            {reflection_text}
          </p>
        </div>

        {/* Date Footer */}
        <p className="text-center text-xs text-muted">{date}</p>
      </div>
    </div>
  );
}
