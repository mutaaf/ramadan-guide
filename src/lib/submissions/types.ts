import type { CompanionGuide } from "@/lib/series/types";

export type SubmissionStatus = "pending" | "reviewing" | "approved" | "rejected";
export type TranscriptSource = "youtube_captions" | "whisper" | "user_paste";

export interface LectureSubmission {
  id: string;
  youtube_url: string;
  youtube_video_id: string;
  title: string;
  speaker_name: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  transcript: string | null;
  transcript_source: TranscriptSource | null;
  companion_guide: CompanionGuide | null;
  submitted_by: string;
  submitted_at: string;
  status: SubmissionStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  approved_series_id: string | null;
  approved_episode_id: string | null;
}
