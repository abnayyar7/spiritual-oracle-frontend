import { ImageResponse } from "@vercel/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const original = searchParams.get("original") || "शरणं गच्छ सर्वभावेन";
  const reflection =
    searchParams.get("reflection") ||
    "Seek refuge with complete devotion. The act of turning toward truth demands totality.";

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full bg-amber-50 px-20 py-16">
        <div tw="flex flex-1 items-center justify-center mb-8">
          <div tw="text-4xl text-center text-amber-950" style={{ fontFamily: "serif" }}>
            {original}
          </div>
        </div>
        <div tw="h-0.5 w-full bg-yellow-600 my-8" />
        <div tw="flex flex-1 items-center justify-center mb-8">
          <div tw="text-2xl text-center text-amber-950 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            {reflection}
          </div>
        </div>
        <div tw="text-center text-sm text-amber-700">
          Spiritual Oracle • spiritualoracle.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
