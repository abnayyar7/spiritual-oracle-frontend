export function cleanVerseText(text: string): string {
  // Remove leading meter labels (चौपाई, दोहा, सोरठा, छंद, etc.)
  const cleanedText = text
    .replace(/^(चौपाई|दोहा|सोरठा|छंद|कवित्त|सवैया|चरण|पद|श्लोक)\s*[\n\r]*/gm, "")
    .trim();

  // Truncate to ~250 characters (roughly 4-5 lines) if too long
  if (cleanedText.length > 250) {
    // Find the last sentence/verse boundary (।। marker)
    const lastDanda = cleanedText.lastIndexOf("।।", 250);
    if (lastDanda > 100) {
      return cleanedText.substring(0, lastDanda + 2).trim();
    }
    // Fallback: truncate at space
    const truncated = cleanedText.substring(0, 250);
    return truncated.substring(0, truncated.lastIndexOf(" ")) + " …";
  }

  return cleanedText;
}
