import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      console.log("❌ [Profile GET] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [Profile GET] User authenticated:", user.id);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("❌ [Profile GET] Query error:", error);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("✅ [Profile GET] Profile retrieved:", {
      id: data.id,
      onboarding_complete: data.onboarding_complete,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ [Profile GET] Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      console.log("❌ [Profile POST] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [Profile POST] User authenticated:", user.id);

    const { first_name, age_range, onboarding_complete } = await request.json();

    console.log("📝 [Profile POST] Updating profile with:", {
      first_name,
      age_range,
      onboarding_complete,
    });

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          first_name: first_name || null,
          age_range: age_range || null,
          onboarding_complete: onboarding_complete || false,
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("❌ [Profile POST] Upsert error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    console.log("✅ [Profile POST] Profile updated successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [Profile POST] Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
