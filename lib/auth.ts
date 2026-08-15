import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
};

/**
 * Current user, or null when signed out.
 *
 * Never throws. Supabase being unreachable — a paused project, a pooler
 * outage, no network — must degrade to the signed-out view rather than
 * take down every page that renders the header.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}

/**
 * Same, but for protected routes: redirects to /login instead of returning
 * null. Mirrors the guard the oracle page already used.
 *
 * Note this treats "Supabase unreachable" as "signed out", which sends a
 * genuinely-logged-in user to /login during an outage. That is the safe
 * direction — the alternative is rendering an account page with no data.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
