import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OracleForm from "./oracle-form";

export default async function OraclePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔍 [Oracle Page] Auth check:", {
    hasUser: !!user,
    userId: user?.id,
  });

  if (!user) {
    console.log("❌ [Oracle Page] No user found - redirecting to /login");
    redirect("/login");
  }

  console.log("✅ [Oracle Page] User authenticated - rendering form");
  return <OracleForm />;
}
