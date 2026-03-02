import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

function verifyAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_SECRET;
  return !!expectedToken && authHeader === `Bearer ${expectedToken}`;
}

/**
 * PATCH — Admin updates a submission (status, transcript, companion, notes, etc.).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields = [
      "status",
      "admin_notes",
      "transcript",
      "transcript_source",
      "companion_guide",
      "approved_series_id",
      "approved_episode_id",
      "reviewed_at",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const admin = await getSupabaseAdminClient();
    const { data, error } = await admin
      .from("lecture_submissions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ submission: data });
  } catch (err) {
    console.error("Update submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update submission" },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Admin removes a submission.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const admin = await getSupabaseAdminClient();

    const { error } = await admin
      .from("lecture_submissions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete submission" },
      { status: 500 }
    );
  }
}
