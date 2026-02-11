"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import {
  getMyPartnerCode,
  isConnectedToPartner,
  connectToPartner,
  getPartnerCode,
} from "@/lib/accountability/sync";
import { isValidPartnerCode } from "@/lib/accountability/types";

export default function PartnerConnectPage() {
  const router = useRouter();
  const [myCode, setMyCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (isConnectedToPartner()) {
      router.replace("/partner");
      return;
    }

    // Get or generate my code
    setMyCode(getMyPartnerCode());
  }, [router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = myCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    const code = inputCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter a partner code");
      return;
    }

    if (!isValidPartnerCode(code)) {
      setError("Invalid code format. Codes are 6 characters.");
      return;
    }

    if (code === myCode) {
      setError("You can't connect to yourself!");
      return;
    }

    setLoading(true);
    setError("");

    const result = await connectToPartner(code);

    setLoading(false);

    if (result.success) {
      router.push("/partner");
    } else {
      setError(result.message);
    }
  };

  const handleShare = async () => {
    const shareText = `Join me on my Ramadan journey! Use code: ${myCode} in the Ramadan Guide app to become accountability partners.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ramadan Partner Code",
          text: shareText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div>
      <PageHeader
        title="Connect Partner"
        subtitle="Stay accountable together"
        back="/partner"
      />

      <div className="px-6 pb-8 space-y-6">
        {/* My Code Section */}
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Your Partner Code
          </p>
          <Card delay={0.05}>
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Share this code with a friend or family member:
            </p>
            <div
              className="flex items-center justify-center gap-2 py-4 rounded-xl mb-4"
              style={{ background: "var(--surface-2)" }}
            >
              <p
                className="text-3xl font-mono font-bold tracking-[0.3em]"
                style={{ color: "var(--accent-gold)" }}
              >
                {myCode}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "var(--surface-2)",
                  color: copied ? "var(--accent-green)" : "var(--foreground)",
                }}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button
                onClick={handleShare}
                className="py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "var(--accent-gold)",
                  color: "#000",
                }}
              >
                Share
              </button>
            </div>
          </Card>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 px-4">
          <div className="flex-1 h-px" style={{ background: "var(--surface-2)" }} />
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            OR
          </p>
          <div className="flex-1 h-px" style={{ background: "var(--surface-2)" }} />
        </div>

        {/* Enter Code Section */}
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Enter Partner&apos;s Code
          </p>
          <Card delay={0.1}>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Have a code from someone? Enter it below:
            </p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase().slice(0, 6));
                setError("");
              }}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full py-4 px-4 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.2em] uppercase mb-4"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground)",
                border: error ? "2px solid #ef4444" : "2px solid transparent",
              }}
            />
            {error && (
              <p className="text-sm text-center mb-4" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleConnect}
              disabled={loading || inputCode.length !== 6}
              className="w-full py-4 rounded-xl text-base font-semibold transition-all disabled:opacity-50"
              style={{
                background: "var(--accent-gold)",
                color: "#000",
              }}
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
          </Card>
        </div>

        {/* Privacy Note */}
        <Card delay={0.15}>
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(34, 197, 94, 0.15)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ color: "var(--accent-green)" }}
              >
                <path
                  d="M8 1.5a3.5 3.5 0 00-3.5 3.5v2h-.5a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1v-5a1 1 0 00-1-1h-.5V5A3.5 3.5 0 008 1.5zM6 5a2 2 0 114 0v2H6V5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Privacy First</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                Your partner only sees aggregate stats: prayer count, streak, and
                hydration status. No names, no personal details, no chat. All data
                stays on your device.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
