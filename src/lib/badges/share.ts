import type { BadgeDefinition } from "./definitions";

export async function shareBadge(blob: Blob, badge: BadgeDefinition): Promise<void> {
  const file = new File([blob], `${badge.id}.png`, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      text: badge.shareText,
      files: [file],
    });
    return;
  }

  // Fallback: download the file
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${badge.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
