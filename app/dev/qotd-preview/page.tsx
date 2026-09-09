import { QOTDCard } from "@/app/components/qotd-card";

export default function QOTDPreviewPage() {
  const sampleData = {
    date: new Date().toISOString().split("T")[0],
    original_text: "शरणं गच्छ सर्वभावेन",
    reflection_text:
      "Seek refuge with complete devotion. The act of turning toward truth demands totality, not half-measure. When the heart surrenders entirely to what is eternal, the mind finds its resting place.",
    chapter_verse: "18.66",
    source_title: "Bhagavad Gita",
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-display text-primary mb-2">
            QOTD Preview
          </h1>
          <p className="text-secondary text-sm">
            Testing the Quote of the Day card and share image generation.
          </p>
        </div>

        {/* Card Preview */}
        <div className="mb-12">
          <h2 className="text-lg font-display text-primary mb-4">Card</h2>
          <QOTDCard {...sampleData} />
        </div>

        {/* Image Generation Preview */}
        <div className="mb-12">
          <h2 className="text-lg font-display text-primary mb-4">
            Share Image
          </h2>
          <p className="text-secondary text-sm mb-4">
            This is how the quote will look when shared on social media.
          </p>

          <div className="bg-surface-2 rounded-lg border border-line p-4">
            <img
              src={`/api/qotd/share-image?date=${sampleData.date}&original=${encodeURIComponent(sampleData.original_text)}&reflection=${encodeURIComponent(sampleData.reflection_text)}`}
              alt="QOTD Share Image"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Technical Notes */}
        <div className="bg-elevated border border-line rounded-lg p-6">
          <h3 className="text-sm font-semibold text-primary mb-3">
            Technical Notes
          </h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li>
              • <strong>Card Design:</strong> Responsive card component with
              share button and two share options (text & image).
            </li>
            <li>
              • <strong>Image Generation:</strong> Server-side rendering using
              @vercel/og with Devanagari (Noto Sans) and English (Cormorant
              Garamond) fonts.
            </li>
            <li>
              • <strong>Share Options:</strong> Web Share API with fallback to
              clipboard for text; mobile file sharing for images.
            </li>
            <li>
              • <strong>Dimensions:</strong> 1200x630px (standard OG/social
              share size).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
