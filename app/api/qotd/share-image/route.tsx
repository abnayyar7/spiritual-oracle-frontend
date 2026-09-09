import { ImageResponse } from "@vercel/og";
import { createClient } from "@/lib/supabase/server";

interface QOTDRow {
  entry_id: number;
  reflection_text: string;
  status: string;
}

interface EntryRow {
  id: number;
  original_text: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const supabase = createClient();

    // Fetch QOTD data for the given date
    const { data: qotdData, error: qotdError } = await supabase
      .from("qotd_daily")
      .select("entry_id, reflection_text, status")
      .eq("display_date", date)
      .eq("status", "ready")
      .single();

    if (qotdError || !qotdData) {
      return new ImageResponse(
        <div tw="flex items-center justify-center w-full h-full bg-amber-50">
          <div tw="text-2xl text-amber-950">Quote not found for {date}</div>
        </div>,
        { width: 1200, height: 630 }
      );
    }

    // Fetch the entry details (original text in Devanagari)
    const { data: entryData, error: entryError } = await supabase
      .from("entries")
      .select("original_text")
      .eq("id", qotdData.entry_id)
      .single();

    if (entryError || !entryData) {
      return new ImageResponse(
        <div tw="flex items-center justify-center w-full h-full bg-amber-50">
          <div tw="text-2xl text-amber-950">Entry not found</div>
        </div>,
        { width: 1200, height: 630 }
      );
    }

    // Load fonts from public directory
    const devanagariFont = await fetch(
      new URL("/fonts/noto-sans-devanagari.woff2", request.url)
    ).then((res) => res.arrayBuffer());

    const cormorantFont = await fetch(
      new URL("/fonts/cormorant-garamond.woff2", request.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 1200,
            height: 630,
            backgroundColor: "#FBF7ED",
            padding: "60px 80px",
            position: "relative",
            fontFamily: "sans-serif",
          }}
        >
          {/* Verse Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: "0 0 auto",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontFamily: "Noto Sans Devanagari",
                color: "#2a2318",
                textAlign: "center",
                lineHeight: 1.3,
                letterSpacing: "-0.5px",
              }}
            >
              {entryData.original_text}
            </div>
          </div>

          {/* Gold Divider */}
          <div
            style={{
              height: 2,
              backgroundColor: "#D4AF37",
              width: "100%",
              margin: "40px 0",
              flex: "0 0 auto",
            }}
          />

          {/* Reflection Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontFamily: "Cormorant Garamond",
                color: "#2a2318",
                textAlign: "center",
                lineHeight: 1.4,
                letterSpacing: "0.3px",
                fontWeight: 400,
              }}
            >
              {qotdData.reflection_text}
            </div>
          </div>

          {/* Branding Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "40px",
              flex: "0 0 auto",
              fontSize: 14,
              color: "#8c8270",
            }}
          >
            Spiritual Oracle • spiritualoracle.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Noto Sans Devanagari",
            data: devanagariFont,
            style: "normal",
          },
          {
            name: "Cormorant Garamond",
            data: cormorantFont,
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    console.error("Failed to generate share image:", error);
    return new ImageResponse(
      <div tw="flex items-center justify-center w-full h-full bg-amber-50">
        <div tw="text-2xl text-amber-950">Error generating image</div>
      </div>,
      { width: 1200, height: 630 }
    );
  }
}
