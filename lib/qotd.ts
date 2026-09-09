import { createClient } from "@/lib/supabase/server";

export interface QOTDData {
  date: string;
  original_text: string;
  reflection_text: string;
  entry_id: number;
}

export async function getTodayQOTD(): Promise<QOTDData | null> {
  const supabase = createClient();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch QOTD with entry details
    const { data, error } = await supabase
      .from("qotd_daily")
      .select(
        `
        display_date,
        reflection_text,
        entry_id,
        entries!inner(original_text)
      `
      )
      .eq("display_date", today)
      .eq("status", "ready")
      .single();

    if (error || !data) {
      console.log("No QOTD available for today:", error?.message);
      return null;
    }

    // Type assertion for the nested entry
    const entryData = data.entries as { original_text: string } | null;

    if (!entryData) {
      console.log("Entry data not found for QOTD");
      return null;
    }

    return {
      date: data.display_date,
      original_text: entryData.original_text,
      reflection_text: data.reflection_text,
      entry_id: data.entry_id,
    };
  } catch (err) {
    console.error("Failed to fetch QOTD:", err);
    return null;
  }
}
