import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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
    const blobOpts = { access: "public" as const, addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" };

    const indexBlob = await put(
      "series/series-index.json",
      JSON.stringify(index),
      blobOpts
    );
    files.push({ path: "series/series-index.json", url: indexBlob.url });

    // Upload each series' episodes file
    for (const [seriesId, data] of Object.entries(seriesData)) {
      const blobPath = `series/${seriesId}/episodes.json`;
      const blob = await put(
        blobPath,
        JSON.stringify(data),
        blobOpts
      );
      files.push({ path: blobPath, url: blob.url });
    }

    // Also update static fallback files (works in dev; no-ops on read-only prod FS)
    try {
      const publicDir = path.join(process.cwd(), "public", "data", "series");
      await mkdir(publicDir, { recursive: true });
      await writeFile(path.join(publicDir, "series-index.json"), JSON.stringify(index, null, 2));
      for (const [sid, data] of Object.entries(seriesData)) {
        const seriesDir = path.join(publicDir, sid);
        await mkdir(seriesDir, { recursive: true });
        await writeFile(path.join(seriesDir, "episodes.json"), JSON.stringify(data, null, 2));
      }
    } catch {
      // Filesystem write failed (e.g. read-only in production) — non-critical
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
