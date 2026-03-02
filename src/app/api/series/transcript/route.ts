import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchYouTubeTranscript } from "@/lib/series/youtube-utils";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const transcriptCache = new Map<string, { data: string; fetchedAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Check cache
    const cached = transcriptCache.get(videoId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ transcript: cached.data, videoId });
    }

    const transcript = await fetchYouTubeTranscript(videoId);
    if (!transcript) {
      return NextResponse.json(
        { error: "No captions found for this video. Try uploading an audio file or pasting the transcript manually." },
        { status: 500 }
      );
    }

    // Store in cache
    transcriptCache.set(videoId, { data: transcript, fetchedAt: Date.now() });

    return NextResponse.json({ transcript, videoId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract transcript" },
      { status: 500 }
    );
  }
}
