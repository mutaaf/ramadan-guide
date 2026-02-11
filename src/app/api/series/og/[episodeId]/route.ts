import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import type { SeriesIndex, SeriesEpisodeData, Episode } from "@/lib/series/types";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_BASE_URL;

async function loadJSON<T>(blobPath: string, fsPath: string): Promise<T> {
  // Try blob first
  if (BLOB_BASE) {
    try {
      const res = await fetch(`${BLOB_BASE}/${blobPath}`);
      if (res.ok) return await res.json();
    } catch {
      // fall through to filesystem
    }
  }

  const raw = await readFile(fsPath, "utf-8");
  return JSON.parse(raw);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;

  try {
    // Load series index
    const index = await loadJSON<SeriesIndex>(
      "series/series-index.json",
      join(process.cwd(), "public/data/series/series-index.json")
    );

    // Find the episode across all series
    let foundEpisode: Episode | null = null;
    let seriesTitle = "";
    let scholarName = "";

    for (const series of index.series) {
      try {
        const data = await loadJSON<SeriesEpisodeData>(
          `series/${series.id}/episodes.json`,
          join(process.cwd(), `public/data/series/${series.id}/episodes.json`)
        );
        const ep = data.episodes.find((e) => e.id === episodeId);
        if (ep) {
          foundEpisode = ep;
          seriesTitle = series.title;
          scholarName = index.scholars.find((s) => s.id === series.scholarId)?.name ?? "";
          break;
        }
      } catch {
        continue;
      }
    }

    if (!foundEpisode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    // Generate a simple SVG-based OG image
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)" />
        <rect x="60" y="60" width="4" height="80" rx="2" fill="#d4a853" />
        <text x="80" y="105" font-family="system-ui, sans-serif" font-size="28" fill="#d4a853" font-weight="600">
          Series Companion
        </text>
        <text x="80" y="220" font-family="system-ui, sans-serif" font-size="48" fill="#ffffff" font-weight="700">
          ${escapeXml(foundEpisode.title)}
        </text>
        <text x="80" y="290" font-family="system-ui, sans-serif" font-size="28" fill="#a0a0b0">
          ${escapeXml(seriesTitle)} — Episode ${foundEpisode.episodeNumber}
        </text>
        <text x="80" y="340" font-family="system-ui, sans-serif" font-size="24" fill="#d4a853">
          ${escapeXml(scholarName)}
        </text>
        <text x="80" y="560" font-family="system-ui, sans-serif" font-size="20" fill="#606080">
          AI-Powered Lecture Guide
        </text>
      </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate OG image" }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
