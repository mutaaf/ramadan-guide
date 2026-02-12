export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

export function validateYouTubeUrl(url: string): string | null {
  if (!url) return null; // optional field
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  if (!patterns.some((p) => p.test(url))) {
    return "Enter a valid YouTube URL";
  }
  return null;
}

export function validateDuration(duration: string): string | null {
  if (!duration.trim()) return "Duration is required";
  if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(duration)) {
    return "Use MM:SS or H:MM:SS format";
  }
  return null;
}

export function validateUrl(url: string): string | null {
  if (!url) return null; // optional
  try {
    new URL(url);
    return null;
  } catch {
    return "Enter a valid URL";
  }
}

export function validatePlaylistUrl(url: string): string | null {
  if (!url.trim()) return "Playlist URL is required";

  // Bare playlist ID
  if (/^PL[\w-]+$/.test(url.trim())) return null;

  // Full URL with list= parameter
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/watch\?.*list=[\w-]+/,
  ];
  if (!patterns.some((p) => p.test(url.trim()))) {
    return "Enter a valid YouTube playlist URL or playlist ID";
  }
  return null;
}

export type FieldErrors = Record<string, string | null>;
