import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const transcriptCache = new Map<string, { data: string; fetchedAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // Extract video ID from various YouTube URL formats
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Check cache
    const cached = transcriptCache.get(videoId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ transcript: cached.data, videoId });
    }

    // Fetch the YouTube page to get captions
    const transcript = await fetchTranscript(videoId);

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

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchTranscript(videoId: string): Promise<string> {
  // Fetch the YouTube video page to extract caption tracks
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SeriesCompanion/1.0)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch YouTube page");
  }

  const html = await res.text();

  // Extract captions URL from the page's player config
  const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionMatch) {
    throw new Error("No captions found for this video. Try uploading an audio file or pasting the transcript manually.");
  }

  let captionTracks: { baseUrl: string; languageCode: string; name?: { simpleText?: string } }[];
  try {
    captionTracks = JSON.parse(captionMatch[1]);
  } catch {
    throw new Error("Failed to parse caption data");
  }

  if (captionTracks.length === 0) {
    throw new Error("No caption tracks available");
  }

  // Prefer English captions
  const track =
    captionTracks.find((t) => t.languageCode === "en") ??
    captionTracks.find((t) => t.languageCode.startsWith("en")) ??
    captionTracks[0];

  // Fetch the captions XML
  const captionRes = await fetch(track.baseUrl);
  if (!captionRes.ok) {
    throw new Error("Failed to fetch captions");
  }

  const xml = await captionRes.text();

  // Parse XML captions to plain text
  const lines = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!lines || lines.length === 0) {
    throw new Error("Failed to parse captions");
  }

  const transcript = lines
    .map((line) => {
      const textMatch = line.match(/<text[^>]*>([\s\S]*?)<\/text>/);
      return textMatch ? decodeHtmlEntities(textMatch[1].trim()) : "";
    })
    .filter(Boolean)
    .join(" ");

  return transcript;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\n/g, " ");
}
