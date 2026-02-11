import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import type { SeriesIndex, SeriesEpisodeData } from "@/lib/series/types";

export async function POST(req: NextRequest) {
  // Authenticate
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_SECRET;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "ADMIN_SECRET not configured on server" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { index, seriesData } = body as {
      index: SeriesIndex;
      seriesData: Record<string, SeriesEpisodeData>;
    };

    if (!index || !seriesData) {
      return NextResponse.json(
        { error: "Missing index or seriesData in request body" },
        { status: 400 }
      );
    }

    const files: { path: string; url: string }[] = [];

    // Upload series index
    const indexBlob = await put(
      "series/series-index.json",
      JSON.stringify(index),
      { access: "public", addRandomSuffix: false, contentType: "application/json" }
    );
    files.push({ path: "series/series-index.json", url: indexBlob.url });

    // Upload each series' episodes file
    for (const [seriesId, data] of Object.entries(seriesData)) {
      const blobPath = `series/${seriesId}/episodes.json`;
      const blob = await put(
        blobPath,
        JSON.stringify(data),
        { access: "public", addRandomSuffix: false, contentType: "application/json" }
      );
      files.push({ path: blobPath, url: blob.url });
    }

    const publishedAt = new Date().toISOString();

    return NextResponse.json({ success: true, publishedAt, files });
  } catch (err) {
    console.error("Publish error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
