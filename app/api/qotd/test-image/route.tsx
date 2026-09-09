import { ImageResponse } from "@vercel/og";

export async function GET(request: Request) {
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const fontDir = join(process.cwd(), "public/fonts");

    const devanagariFont = await readFile(
      join(fontDir, "noto-sans-devanagari.woff2")
    );

    const cormorantFont = await readFile(
      join(fontDir, "cormorant-garamond.woff2")
    );

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
              मन:शान्तिर्भवत्यसंशयम्
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
              Peace of mind arises from clarity and freedom from doubt. When the mind settles into stillness, uncertainty dissolves.
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
    console.error("Failed to generate test image:", error);
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
}
