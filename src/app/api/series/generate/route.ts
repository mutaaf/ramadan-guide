import { NextRequest, NextResponse } from "next/server";
import { generateCompanionGuide } from "@/lib/series/companion-generator";

export async function POST(req: NextRequest) {
  try {
    const {
      transcript,
      scholarName,
      seriesTitle,
      episodeNumber,
      episodeTitle,
      otherEpisodes,
    } = await req.json();

    if (!transcript || !scholarName || !seriesTitle || !episodeTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companion = await generateCompanionGuide({
      transcript,
      scholarName,
      seriesTitle,
      episodeNumber: episodeNumber || 1,
      episodeTitle,
      otherEpisodes,
    });

    return NextResponse.json({ companion: { ...companion, episodeId: "" } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
