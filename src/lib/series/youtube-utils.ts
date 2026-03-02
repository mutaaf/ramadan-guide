/**
 * Shared YouTube utilities used by transcript extraction, playlist import,
 * and lecture submissions.
 */

/** Extract a YouTube video ID from various URL formats. */
export function extractVideoId(url: string): string | null {
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

/** Decode common HTML entities found in YouTube captions/metadata. */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\n/g, " ");
}

export interface VideoMetadata {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

/**
 * Fetch basic video metadata using YouTube oEmbed (no API key required).
 * Returns title, author, and thumbnail URL.
 */
export async function fetchVideoMetadata(youtubeUrl: string): Promise<VideoMetadata> {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch video metadata. The video may be private or unavailable.");
  }
  const data = (await res.json()) as {
    title: string;
    author_name: string;
    thumbnail_url: string;
  };
  return {
    title: data.title,
    author_name: data.author_name,
    thumbnail_url: data.thumbnail_url,
  };
}

/**
 * Fetch YouTube captions for a video. Returns the transcript text or null
 * if no captions are available.
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SeriesCompanion/1.0)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return null;

  const html = await res.text();

  const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionMatch) return null;

  let captionTracks: { baseUrl: string; languageCode: string }[];
  try {
    captionTracks = JSON.parse(captionMatch[1]);
  } catch {
    return null;
  }

  if (captionTracks.length === 0) return null;

  const track =
    captionTracks.find((t) => t.languageCode === "en") ??
    captionTracks.find((t) => t.languageCode.startsWith("en")) ??
    captionTracks[0];

  const captionRes = await fetch(track.baseUrl);
  if (!captionRes.ok) return null;

  const xml = await captionRes.text();
  const lines = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!lines || lines.length === 0) return null;

  return lines
    .map((line) => {
      const textMatch = line.match(/<text[^>]*>([\s\S]*?)<\/text>/);
      return textMatch ? decodeHtmlEntities(textMatch[1].trim()) : "";
    })
    .filter(Boolean)
    .join(" ");
}
