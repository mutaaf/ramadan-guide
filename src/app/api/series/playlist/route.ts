import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const playlistCache = new Map<string, { data: PlaylistData; fetchedAt: number }>();

interface PlaylistVideo {
  videoId: string;
  title: string;
  duration: string;
  youtubeUrl: string;
  position: number;
}

interface PlaylistData {
  title: string;
  description: string;
  channelName: string;
  videoCount: number;
  videos: PlaylistVideo[];
  partial?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { playlistUrl } = await req.json();

    if (!playlistUrl || typeof playlistUrl !== "string") {
      return NextResponse.json(
        { error: "Playlist URL is required" },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid playlist URL" },
        { status: 400 }
      );
    }

    // Check cache
    const cached = playlistCache.get(playlistId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ playlist: cached.data });
    }

    const playlist = await fetchPlaylistData(playlistId);

    // Store in cache
    playlistCache.set(playlistId, { data: playlist, fetchedAt: Date.now() });

    return NextResponse.json({ playlist });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to extract playlist data";
    const status =
      err instanceof PlaylistError ? err.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

class PlaylistError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractPlaylistId(url: string): string | null {
  // Bare playlist ID
  if (/^PL[\w-]+$/.test(url)) return url;

  // URL with list= parameter
  try {
    const parsed = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );
    const listParam = parsed.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // not a URL
  }

  return null;
}

async function fetchPlaylistData(playlistId: string): Promise<PlaylistData> {
  const pageUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SeriesCompanion/1.0)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (res.status === 404) {
    throw new PlaylistError(
      "Playlist not found or is private",
      404
    );
  }

  if (res.status === 403 || res.status === 429) {
    throw new PlaylistError(
      "YouTube rate limiting. Try again in a few minutes.",
      429
    );
  }

  if (!res.ok) {
    throw new PlaylistError("Failed to fetch YouTube page", 500);
  }

  const html = await res.text();

  // Extract ytInitialData from script tag
  const dataMatch = html.match(
    /var\s+ytInitialData\s*=\s*({[\s\S]*?});\s*<\/script>/
  );
  if (!dataMatch) {
    throw new PlaylistError("Could not extract playlist data", 500);
  }

  let ytData: Record<string, unknown>;
  try {
    ytData = JSON.parse(dataMatch[1]);
  } catch {
    throw new PlaylistError("Could not parse playlist data", 500);
  }

  // Extract API key for continuation requests
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  const apiKey = apiKeyMatch?.[1] ?? null;

  // Navigate the data structure to find playlist info
  const metadata = getNestedValue(
    ytData,
    "metadata.playlistMetadataRenderer"
  ) as Record<string, unknown> | null;

  const header = getNestedValue(
    ytData,
    "header.playlistHeaderRenderer"
  ) as Record<string, unknown> | null;

  const title =
    (metadata?.title as string) ?? "Untitled Playlist";
  const description =
    (metadata?.description as string) ?? "";

  // Channel name from header
  const ownerText = getNestedValue(
    header,
    "ownerText.runs"
  ) as { text: string }[] | null;
  const channelName = ownerText?.[0]?.text ?? "Unknown Channel";

  // Extract videos from tabs
  const tabs = getNestedValue(
    ytData,
    "contents.twoColumnBrowseResultsRenderer.tabs"
  ) as Record<string, unknown>[] | null;

  const tabContent = getNestedValue(
    tabs?.[0],
    "tabRenderer.content.sectionListRenderer.contents"
  ) as Record<string, unknown>[] | null;

  const itemSection = getNestedValue(
    tabContent?.[0],
    "itemSectionRenderer.contents"
  ) as Record<string, unknown>[] | null;

  const playlistContents = getNestedValue(
    itemSection?.[0],
    "playlistVideoListRenderer.contents"
  ) as Record<string, unknown>[] | null;

  if (!playlistContents || playlistContents.length === 0) {
    throw new PlaylistError(
      "Playlist not found or is private",
      404
    );
  }

  let videos = extractVideos(playlistContents);
  let partial = false;

  // Handle pagination (100+ video playlists)
  const MAX_VIDEOS = 500;
  let continuationToken = extractContinuationToken(playlistContents);

  while (continuationToken && apiKey && videos.length < MAX_VIDEOS) {
    try {
      const continuationResult = await fetchContinuation(
        continuationToken,
        apiKey
      );
      if (continuationResult.videos.length === 0) break;
      videos = videos.concat(continuationResult.videos);
      continuationToken = continuationResult.continuationToken;
    } catch {
      partial = true;
      break;
    }
  }

  // Re-number positions sequentially
  videos = videos.map((v, i) => ({ ...v, position: i + 1 }));

  return {
    title,
    description,
    channelName,
    videoCount: videos.length,
    videos,
    ...(partial ? { partial: true } : {}),
  };
}

function extractVideos(
  contents: Record<string, unknown>[]
): PlaylistVideo[] {
  const videos: PlaylistVideo[] = [];
  for (const item of contents) {
    const renderer = item.playlistVideoRenderer as
      | Record<string, unknown>
      | undefined;
    if (!renderer) continue;

    const videoId = renderer.videoId as string;
    if (!videoId) continue;

    const titleRuns = getNestedValue(renderer, "title.runs") as
      | { text: string }[]
      | null;
    const title = titleRuns?.[0]?.text ?? "Untitled";

    const lengthText = getNestedValue(
      renderer,
      "lengthText.simpleText"
    ) as string | null;
    const duration = lengthText ?? "0:00";

    videos.push({
      videoId,
      title,
      duration,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      position: videos.length + 1,
    });
  }
  return videos;
}

function extractContinuationToken(
  contents: Record<string, unknown>[]
): string | null {
  const lastItem = contents[contents.length - 1];
  const token = getNestedValue(
    lastItem,
    "continuationItemRenderer.continuationEndpoint.continuationCommand.token"
  ) as string | null;
  return token;
}

async function fetchContinuation(
  token: string,
  apiKey: string
): Promise<{ videos: PlaylistVideo[]; continuationToken: string | null }> {
  const res = await fetch(
    `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
          },
        },
        continuation: token,
      }),
    }
  );

  if (!res.ok) throw new Error("Continuation fetch failed");

  const data = (await res.json()) as Record<string, unknown>;
  const actions = getNestedValue(
    data,
    "onResponseReceivedActions"
  ) as Record<string, unknown>[] | null;

  const appendAction = actions?.[0];
  const continuationItems = getNestedValue(
    appendAction,
    "appendContinuationItemsAction.continuationItems"
  ) as Record<string, unknown>[] | null;

  if (!continuationItems) {
    return { videos: [], continuationToken: null };
  }

  const videos = extractVideos(continuationItems);
  const continuationToken = extractContinuationToken(continuationItems);

  return { videos, continuationToken };
}

// Helper to safely traverse nested objects using dot-separated paths
function getNestedValue(
  obj: unknown,
  path: string
): unknown {
  if (obj == null) return null;
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}
