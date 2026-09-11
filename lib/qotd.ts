import { createClient } from "@/lib/supabase/server";

export interface QOTDData {
  date: string;
  original_text: string;
  reflection_text: string;
  entry_id: number;
  source_name?: string;
}

function cleanVerseText(text: string): string {
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

export async function getTodayQOTD(overrideDate?: string): Promise<QOTDData | null> {
  const supabase = createClient();

  // Determine the date to use
  let dateToFetch = new Date().toISOString().split("T")[0];

  // Dev-only: allow URL parameter override, but only in development
  if (process.env.NODE_ENV !== "production" && overrideDate) {
    dateToFetch = overrideDate;
  }

  try {
    // Fetch QOTD with entry details
    const { data, error } = await supabase
      .from("qotd_daily")
      .select(
        `
        display_date,
        reflection_text,
        entry_id,
        entries(
          original_text,
          source_id
        )
      `
      )
      .eq("display_date", dateToFetch)
      .eq("status", "ready")
      .single();

    if (error || !data) {
      console.log("No QOTD available for today:", error?.message);
      return null;
    }

    // Handle the nested entry data - can be array or single object
    const entryArray = (data as any).entries as Array<{ original_text: string; source_id?: number }> | null;
    const entryData = Array.isArray(entryArray) ? entryArray[0] : entryArray;

    if (!entryData?.original_text) {
      console.log("Entry data not found for QOTD");
      return null;
    }

    // Fetch source name if source_id is available
    let sourceName: string | undefined;
    if (entryData.source_id) {
      const { data: sourceData } = await supabase
        .from("sources")
        .select("title")
        .eq("id", entryData.source_id)
        .single();
      sourceName = sourceData?.title;
    }

    return {
      date: (data as any).display_date,
      original_text: cleanVerseText(entryData.original_text),
      reflection_text: (data as any).reflection_text,
      entry_id: (data as any).entry_id,
      source_name: sourceName,
    };
  } catch (err) {
    console.error("Failed to fetch QOTD:", err);
    return null;
  }
}
