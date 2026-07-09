import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OracleForm from "./oracle-form";

export default async function OraclePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <OracleForm />;
}
