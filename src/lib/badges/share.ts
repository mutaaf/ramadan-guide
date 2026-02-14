import type { BadgeDefinition } from "./definitions";
import { APP_URL, type VideoResult } from "./capture";

export function buildShareCaption(badge: BadgeDefinition): string {
  return [
    badge.shareText,
    "",
    "Track your Ramadan journey:",
    APP_URL,
    "",
    "#RamadanCompanion #Ramadan2026 #Ramadan #Muslim",
  ].join("\n");
}

export async function copyCaption(badge: BadgeDefinition): Promise<boolean> {
  const caption = buildShareCaption(badge);
  try {
    await navigator.clipboard.writeText(caption);
    return true;
  } catch {
    return false;
  }
}

export async function shareBadgeImage(blob: Blob, badge: BadgeDefinition): Promise<"shared" | "downloaded" | "error"> {
  const file = new File([blob], `ramadan-${badge.id}.png`, { type: "image/png" });
  const caption = buildShareCaption(badge);

  // Try native share (works on iOS 15+, Android Chrome — opens IG, Snap, TikTok, etc.)
  if (navigator.share) {
    try {
      const shareData: ShareData = { text: caption, files: [file] };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return "shared";
      }
    } catch (e) {
      // User cancelled or share failed — fall through to download
      if (e instanceof Error && e.name === "AbortError") return "shared"; // user cancelled is ok
    }
  }

  // Fallback: download the file
  downloadBlob(blob, `ramadan-${badge.id}.png`);
  return "downloaded";
}

export async function shareBadgeVideo(result: VideoResult, badge: BadgeDefinition): Promise<"shared" | "downloaded" | "error"> {
  const file = new File([result.blob], `ramadan-${badge.id}.${result.extension}`, { type: result.mimeType });
  const caption = buildShareCaption(badge);

  if (navigator.share) {
    try {
      const shareData: ShareData = { text: caption, files: [file] };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return "shared";
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "shared";
    }
  }

  downloadBlob(result.blob, `ramadan-${badge.id}.${result.extension}`);
  return "downloaded";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
