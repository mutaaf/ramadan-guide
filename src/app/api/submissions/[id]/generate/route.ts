import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { generateCompanionGuide } from "@/lib/series/companion-generator";

/**
 * POST — Admin triggers companion guide generation for a submission.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const admin = await getSupabaseAdminClient();

    // Fetch the submission
    const { data: submission, error: fetchError } = await admin
      .from("lecture_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (!submission.transcript) {
      return NextResponse.json(
        { error: "No transcript available. Add a transcript before generating a companion guide." },
        { status: 400 }
      );
    }

    // Generate companion guide
    const companion = await generateCompanionGuide({
      transcript: submission.transcript,
      scholarName: submission.speaker_name || "Unknown Speaker",
      seriesTitle: submission.title,
      episodeTitle: submission.title,
    });

    // Update submission with companion
    const { error: updateError } = await admin
      .from("lecture_submissions")
      .update({ companion_guide: companion })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ companion });
  } catch (err) {
    console.error("Generate companion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
