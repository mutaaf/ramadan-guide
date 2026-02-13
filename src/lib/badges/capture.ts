import { toPng } from "html-to-image";

export type CaptureFormat = "feed" | "story";

const FORMAT_DIMENSIONS: Record<CaptureFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export async function captureBadgeImage(
  element: HTMLElement,
  format: CaptureFormat
): Promise<Blob> {
  const { width, height } = FORMAT_DIMENSIONS[format];

  const dataUrl = await toPng(element, {
    width,
    height,
    pixelRatio: 1,
    backgroundColor: "#1a1a1c",
  });

  const res = await fetch(dataUrl);
  return res.blob();
}
