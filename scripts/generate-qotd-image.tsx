import React from "react";
import { ImageResponse } from "@vercel/og";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function generateImage() {
  const publicDir = join(process.cwd(), "public/fonts");

  // Load fonts
  const devanagariFont = readFileSync(
    join(publicDir, "noto-sans-devanagari.woff2")
  );
  const cormorantFont = readFileSync(
    join(publicDir, "cormorant-garamond.woff2")
  );

  console.log("📦 Fonts loaded:");
  console.log(`   Devanagari: ${devanagariFont.length} bytes`);
  console.log(`   Cormorant: ${cormorantFont.length} bytes`);

  // Create ImageResponse
  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          backgroundColor: "#FBF7ED",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Verse */}
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
            }}
          >
            यस्मात्क्षरमतीतोsहमक्षरादपि चोत्तमः ।
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 2,
            backgroundColor: "#D4AF37",
            width: "100%",
            margin: "40px 0",
          }}
        />

        {/* Reflection */}
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
              fontWeight: 400,
            }}
          >
            I am beyond the perishable, higher than the imperishable. Thus I am known as Purushottama, the Supreme Person.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 14,
            color: "#8c8270",
            textAlign: "center",
            marginTop: "40px",
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

  // Get buffer
  const buffer = await response.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  // Write to file
  const outputPath = join(process.cwd(), "qotd-sample.png");
  writeFileSync(outputPath, uint8);

  console.log(`\n✅ PNG generated: ${outputPath}`);
  console.log(`   Size: ${(uint8.length / 1024).toFixed(1)} KB`);
  console.log(`   Dimensions: 1200×630px`);
  console.log(`   Fonts: Devanagari (verse) + Garamond (reflection)`);
}

generateImage().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
