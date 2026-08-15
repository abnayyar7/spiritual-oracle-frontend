import { createClient } from "@/lib/supabase/server";

/*
 * Reads for the account and history pages.
 *
 * Everything here degrades to null/empty rather than throwing. These tables
 * are governed by row-level security; if the policies are not in place yet the
 * queries return no rows rather than an error, and the pages should show their
 * empty states instead of a stack trace.
 */

export type Profile = {
  subscription_tier: string;
  questions_used: number;
  questions_reset_at: string | null;
};

export type HistoryRow = {
  id: number;
  created_at: string;
  user_question: string;
  user_number: number;
  generated_takeaway: string | null;
  source_title: string | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_tier, questions_used, questions_reset_at")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export const HISTORY_PAGE_SIZE = 10;

export async function getHistory(
  userId: string,
  page = 0,
): Promise<{ rows: HistoryRow[]; total: number }> {
  try {
    const supabase = createClient();
    const from = page * HISTORY_PAGE_SIZE;
    const to = from + HISTORY_PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("user_queries")
      .select(
        "id, created_at, user_question, user_number, generated_takeaway, sources(title)",
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !data) return { rows: [], total: 0 };

    const rows: HistoryRow[] = data.map((r) => {
      // Supabase types an embedded one-to-one as an array in some versions.
      const src = r.sources as unknown;
      const title = Array.isArray(src)
        ? ((src[0] as { title?: string } | undefined)?.title ?? null)
        : ((src as { title?: string } | null)?.title ?? null);

      return {
        id: r.id as number,
        created_at: r.created_at as string,
        user_question: r.user_question as string,
        user_number: r.user_number as number,
        generated_takeaway: (r.generated_takeaway as string | null) ?? null,
        source_title: title,
      };
    });

    return { rows, total: count ?? rows.length };
  } catch {
    return { rows: [], total: 0 };
  }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
