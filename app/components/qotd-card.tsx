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

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function QOTDCard({
  date,
  original_text,
  reflection_text,
  chapter_verse = "Bhagavad Gita",
  source_title,
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
      const imageUrl = `/api/qotd/share-image?date=${date}`;
      console.log("🖼️ Fetching image from API:", imageUrl);

      const response = await fetch(imageUrl);
      console.log(
        `✓ Image fetched, status: ${response.status}, content-type: ${response.headers.get("content-type")}`
      );

      const blob = await response.blob();
      console.log(`✓ Blob created, size: ${blob.size} bytes, type: ${blob.type}`);

      // Log iOS Safari capabilities
      console.log(`📱 navigator.share exists: ${!!navigator.share}`);
      console.log(`📱 navigator.canShare exists: ${!!navigator.canShare}`);

      // Try native share first (iOS Safari may not have canShare but still supports share with files)
      if (navigator.share) {
        console.log("→ Attempting native share with file...");
        const fileName = `spiritual-oracle-${date}.png`;
        const file = new File([blob], fileName, {
          type: "image/png",
        });
        console.log(`✓ File created: ${fileName}, type: ${file.type}`);

        try {
          await navigator.share({
            title: `Quote of the Day — ${date}`,
            text: reflection_text,
            files: [file],
          });
          console.log("✓ Native share completed");
          return;
        } catch (shareErr) {
          const errorName = (shareErr as Error).name;
          const errorMsg = (shareErr as Error).message;
          console.warn(
            `⚠️ Native share failed [${errorName}]: ${errorMsg}`
          );
          if (errorName === "AbortError") {
            console.log("ℹ️ User cancelled share");
            return;
          }
          if (
            errorName === "NotAllowedError" ||
            errorName === "TypeError"
          ) {
            console.log("→ Share not supported, falling back to download");
            // Continue to download fallback below
          } else {
            throw shareErr;
          }
        }
      }

      // Fallback: download the image
      console.log("→ Using download fallback");
      const objectUrl = URL.createObjectURL(blob);
      console.log("✓ Object URL created");

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `spiritual-oracle-${date}.png`;
      document.body.appendChild(link);
      console.log("✓ Link element appended to DOM");

      link.click();
      console.log("✓ Click triggered, download should start");

      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        console.log("✓ Cleanup completed");
      }, 100);
    } catch (err) {
      console.error("❌ Image share failed:", (err as Error).message);
      console.error("Full error:", err);
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
      <div className="bg-elevated rounded-lg border border-line-strong p-8 shadow-lg">
        {/* Verse */}
        <div className="text-center mb-8">
          <p className="font-deva text-2xl text-primary leading-relaxed">
            {original_text}
          </p>
          <p className="text-xs text-muted mt-3">{source_title || chapter_verse}</p>
        </div>

        {/* Gold Divider */}
        <div className="h-px bg-accent mb-8 mx-auto w-16" />

        {/* Reflection */}
        <div className="text-center mb-8">
          <p className="font-display text-xl text-primary leading-relaxed">
            {reflection_text}
          </p>
        </div>

        {/* Date and Share Footer */}
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-line">
          <p className="text-center text-xs text-muted">{formatDate(date)}</p>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-secondary hover:text-accent transition-colors"
              aria-label="Share"
              title="Share this quote"
            >
              <Share2 size={16} />
              Share
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-elevated border border-line rounded-lg shadow-xl z-50 min-w-max">
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
        </div>
      </div>
    </div>
  );
}
