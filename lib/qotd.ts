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
        entries(original_text)
      `
      )
      .eq("display_date", today)
      .eq("status", "ready")
      .single();

    if (error || !data) {
      console.log("No QOTD available for today:", error?.message);
      return null;
    }

    // Handle the nested entry data - can be array or single object
    const entryArray = (data as any).entries as Array<{ original_text: string }> | null;
    const entryData = Array.isArray(entryArray) ? entryArray[0] : entryArray;

    if (!entryData?.original_text) {
      console.log("Entry data not found for QOTD");
      return null;
    }

    return {
      date: (data as any).display_date,
      original_text: entryData.original_text,
      reflection_text: (data as any).reflection_text,
      entry_id: (data as any).entry_id,
    };
  } catch (err) {
    console.error("Failed to fetch QOTD:", err);
    return null;
  }
}
