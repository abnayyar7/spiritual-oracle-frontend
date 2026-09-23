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

    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, create a default one for new users
    if (error && error.code === "PGRST116") {
      console.log("📝 [Profile GET] Profile not found, creating default...");

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: null,
          age_range: null,
          onboarding_complete: false,
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ [Profile GET] Failed to create profile:", createError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }

      data = newProfile;
      console.log("✅ [Profile GET] Default profile created:", {
        id: data.id,
        onboarding_complete: data.onboarding_complete,
      });
    } else if (error) {
      console.error("❌ [Profile GET] Query error:", error);
      return NextResponse.json({ error: "Profile query failed" }, { status: 500 });
    } else {
      console.log("✅ [Profile GET] Profile retrieved:", {
        id: data.id,
        onboarding_complete: data.onboarding_complete,
      });
    }

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
