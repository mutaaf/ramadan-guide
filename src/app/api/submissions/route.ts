import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { extractVideoId, fetchVideoMetadata, fetchYouTubeTranscript } from "@/lib/series/youtube-utils";

/**
 * POST — User submits a YouTube lecture for review.
 * Requires Supabase auth (Bearer token from localStorage).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getSupabaseAdminClient();

    // Verify user auth via access token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { youtubeUrl, speakerName, description } = body as {
      youtubeUrl: string;
      speakerName?: string;
      description?: string;
    };

    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Check for duplicate submission
    const { data: existing } = await admin
      .from("lecture_submissions")
      .select("id, title, status")
      .eq("youtube_video_id", videoId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "This video has already been submitted",
          existingSubmission: { id: existing.id, title: existing.title, status: existing.status },
        },
        { status: 409 }
      );
    }

    // Fetch video metadata via oEmbed
    let metadata: { title: string; author_name: string; thumbnail_url: string };
    try {
      metadata = await fetchVideoMetadata(`https://www.youtube.com/watch?v=${videoId}`);
    } catch {
      return NextResponse.json(
        { error: "Could not fetch video info. The video may be private or unavailable." },
        { status: 400 }
      );
    }

    // Attempt to extract YouTube captions
    let transcript: string | null = null;
    let transcriptSource: string | null = null;
    try {
      transcript = await fetchYouTubeTranscript(videoId);
      if (transcript) {
        transcriptSource = "youtube_captions";
      }
    } catch {
      // Captions not available — OK, admin can add later
    }

    // Insert submission
    const { data: submission, error: insertError } = await admin
      .from("lecture_submissions")
      .insert({
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        youtube_video_id: videoId,
        title: metadata.title,
        speaker_name: speakerName || metadata.author_name || null,
        description: description || null,
        thumbnail_url: metadata.thumbnail_url || null,
        transcript,
        transcript_source: transcriptSource,
        submitted_by: user.id,
        status: "pending",
      })
      .select("id, title")
      .single();

    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This video has already been submitted" },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json({
      id: submission.id,
      title: submission.title,
      hasTranscript: !!transcript,
    });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit lecture" },
      { status: 500 }
    );
  }
}

/**
 * GET — Admin lists submissions.
 * Requires Authorization: Bearer ADMIN_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_SECRET;

  if (!expectedToken) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = await getSupabaseAdminClient();

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "pending";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const { data, error, count } = await admin
      .from("lecture_submissions")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ submissions: data, count });
  } catch (err) {
    console.error("List submissions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list submissions" },
      { status: 500 }
    );
  }
}
