"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { getSupabaseBrowserClient, isSupabaseConfigured, signInWithPopup } from "@/lib/supabase/client";
import { extractVideoId } from "@/lib/series/youtube-utils";

type SubmitState = "idle" | "loading" | "success" | "error";

interface VideoPreview {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

export default function SubmitLecturePage() {
  const [url, setUrl] = useState("");
  const [speakerName, setSpeakerName] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [resultTitle, setResultTitle] = useState("");
  const [hasTranscript, setHasTranscript] = useState(false);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  // Check auth on mount
  const checkAuth = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsSignedIn(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    setIsSignedIn(!!user);
  }, []);

  // Run auth check once
  useState(() => { checkAuth(); });

  const fetchPreview = useCallback(async (youtubeUrl: string) => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        setPreview({
          title: data.title,
          author_name: data.author_name,
          thumbnail_url: data.thumbnail_url,
        });
        if (!speakerName) {
          setSpeakerName(data.author_name || "");
        }
      } else {
        setPreview(null);
      }
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [speakerName]);

  const handleUrlBlur = () => {
    if (url.trim()) fetchPreview(url.trim());
  };

  const handleSubmit = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setState("loading");
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setState("error");
        setError("Please sign in to submit a lecture.");
        return;
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          youtubeUrl: url.trim(),
          speakerName: speakerName.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error || "Something went wrong.");
        return;
      }

      setState("success");
      setResultTitle(data.title);
      setHasTranscript(data.hasTranscript);
    } catch {
      setState("error");
      setError("Network error. Please try again.");
    }
  };

  const handleSignIn = async (provider: "google" | "apple") => {
    const { success } = await signInWithPopup(provider);
    if (success) setIsSignedIn(true);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div>
        <PageHeader title="Suggest a Lecture" back="/learn/series" />
        <div className="px-6 pb-8">
          <Card>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              This feature is not available right now.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Suggest a Lecture" subtitle="Submit a YouTube lecture for review" back="/learn/series" />
      <div className="px-6 pb-8 space-y-4">
        {/* Not signed in */}
        {isSignedIn === false && (
          <Card>
            <p className="text-sm font-medium mb-3">Sign in to submit lectures</p>
            <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
              Your submissions will be reviewed by our team before being added to the library.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSignIn("google")}
                className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-opacity active:opacity-80"
                style={{ background: "var(--surface-1)" }}
              >
                Google
              </button>
              <button
                onClick={() => handleSignIn("apple")}
                className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-opacity active:opacity-80"
                style={{ background: "var(--surface-1)" }}
              >
                Apple
              </button>
            </div>
          </Card>
        )}

        {/* Auth loading */}
        {isSignedIn === null && (
          <div className="flex justify-center py-12">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {/* Signed in — form */}
        {isSignedIn === true && state !== "success" && (
          <>
            <Card>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
                YouTube URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--card-border)",
                  color: "var(--foreground)",
                }}
              />

              {/* Video preview */}
              {previewLoading && (
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
                  />
                  <span className="text-xs" style={{ color: "var(--muted)" }}>Loading preview...</span>
                </div>
              )}
              {preview && !previewLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mt-3 p-2 rounded-xl"
                  style={{ background: "var(--surface-1)" }}
                >
                  <img
                    src={preview.thumbnail_url}
                    alt=""
                    className="w-20 h-15 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">{preview.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{preview.author_name}</p>
                  </div>
                </motion.div>
              )}
            </Card>

            <Card>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
                Speaker Name
              </label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="e.g. Sheikh Omar Suleiman"
                className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--card-border)",
                  color: "var(--foreground)",
                }}
              />
            </Card>

            <Card>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
                Description <span className="normal-case font-normal" style={{ color: "var(--muted)" }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why do you recommend this lecture?"
                rows={3}
                className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--card-border)",
                  color: "var(--foreground)",
                }}
              />
            </Card>

            {error && (
              <p className="text-sm text-center px-2" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!url.trim() || state === "loading"}
              className="w-full text-sm font-semibold py-3 rounded-2xl transition-opacity disabled:opacity-40"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              {state === "loading" ? "Submitting..." : "Submit Lecture"}
            </button>
          </>
        )}

        {/* Success state */}
        {state === "success" && (
          <Card>
            <div className="text-center py-4">
              <div className="text-3xl mb-3">&#9989;</div>
              <p className="font-semibold text-sm mb-1">Thank you!</p>
              <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                &ldquo;{resultTitle}&rdquo; has been submitted for review.
              </p>
              {!hasTranscript && (
                <p className="text-[10px] mt-2" style={{ color: "var(--muted)" }}>
                  Note: This video doesn&apos;t have captions. Our team will handle transcription.
                </p>
              )}
              <button
                onClick={() => {
                  setState("idle");
                  setUrl("");
                  setSpeakerName("");
                  setDescription("");
                  setPreview(null);
                  setResultTitle("");
                  setError("");
                }}
                className="mt-4 text-xs font-medium px-4 py-2 rounded-xl"
                style={{ background: "var(--surface-1)" }}
              >
                Submit Another
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
