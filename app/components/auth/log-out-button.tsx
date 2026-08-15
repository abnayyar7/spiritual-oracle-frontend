"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LogOutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // Network failure still clears the local view; middleware catches up.
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={
        className ||
        "inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-6 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary disabled:opacity-60"
      }
    >
      {busy ? "Logging out…" : "Log Out"}
    </button>
  );
}
