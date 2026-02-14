import type { BadgeDefinition, BadgeTier } from "./definitions";

export type CaptureFormat = "feed" | "story";

export const DIMENSIONS = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

const TIER_STYLE: Record<BadgeTier, { primary: string; secondary: string; glow: string }> = {
  bronze: { primary: "#cd7f32", secondary: "#a0522d", glow: "rgba(205, 127, 50, 0.35)" },
  silver: { primary: "#d4d4d8", secondary: "#a1a1aa", glow: "rgba(212, 212, 216, 0.35)" },
  gold: { primary: "#e8c75a", secondary: "#c9a84c", glow: "rgba(232, 199, 90, 0.45)" },
};

// Layout constants per format
const LAYOUT = {
  feed: {
    iconY: 290, iconR: 95, sparkleSpread: 220,
    tierY: 430, titleY: 500, subtitleY: 610,
    lineY: 680, captionY: 730, brandY: 920, hashY: 980,
  },
  story: {
    iconY: 500, iconR: 110, sparkleSpread: 260,
    tierY: 660, titleY: 740, subtitleY: 860,
    lineY: 940, captionY: 1000, brandY: 1640, hashY: 1720,
  },
};

const FONT = "-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif";
export const APP_URL = "myramadanguide.com";

const TWO_PI = Math.PI * 2;

// ── Drawing Helpers ──

function starPoints(cx: number, cy: number, outerR: number, innerR: number, n = 8): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

function drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, n = 8) {
  const pts = starPoints(cx, cy, outerR, innerR, n);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number, lineHeight: number, startY: number): number {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line + (line ? " " : "") + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

// ── Utility: sinusoidal interpolation ──

function sinLerp(time: number, phaseOffset: number, min: number, max: number): number {
  const t = (Math.sin(time * TWO_PI + phaseOffset) + 1) / 2; // 0..1
  return min + t * (max - min);
}

// ── Geometric Pattern ──

function drawGeometricPattern(ctx: CanvasRenderingContext2D, w: number, h: number, time?: number) {
  const spacing = 90;
  const outerR = 26;
  const innerR = 11;

  ctx.save();
  ctx.strokeStyle = "#c9a84c";
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = time !== undefined ? sinLerp(time, 0, 0.055, 0.085) : 0.07;

  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      drawStarPath(ctx, x, y, outerR, innerR);
      ctx.stroke();
      if (x + spacing < w + spacing) {
        ctx.beginPath();
        ctx.moveTo(x + outerR, y);
        ctx.lineTo(x + spacing - outerR, y);
        ctx.stroke();
      }
      if (y + spacing < h + spacing) {
        ctx.beginPath();
        ctx.moveTo(x, y + outerR);
        ctx.lineTo(x, y + spacing - outerR);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

// ── Sparkle/Shine Elements ──

function drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number, spread: number, color: string, time?: number) {
  ctx.save();
  // Outer ring of 4-pointed sparkles
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + 0.3;
    const dist = spread * (0.55 + 0.45 * ((i * 7 + 3) % 10) / 10);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const baseSize = 3 + ((i * 3 + 1) % 6);
    const baseAlpha = 0.15 + 0.35 * ((i * 7) % 10) / 10;

    const phaseOffset = i * Math.PI / 8;
    const alpha = time !== undefined
      ? sinLerp(time, phaseOffset, baseAlpha * 0.3, baseAlpha * 1.4)
      : baseAlpha;
    const size = time !== undefined
      ? baseSize * sinLerp(time, phaseOffset + 1, 0.7, 1.3)
      : baseSize;

    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.fillStyle = color;
    // Vertical diamond
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.25, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.25, y);
    ctx.closePath();
    ctx.fill();
    // Horizontal diamond
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y + size * 0.25);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y - size * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  // Small dots scattered
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + 1.1;
    const dist = spread * (0.3 + 0.7 * ((i * 11 + 5) % 10) / 10);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const baseAlpha = 0.08 + 0.15 * ((i * 3) % 10) / 10;
    const phaseOffset = i * Math.PI / 12;

    ctx.globalAlpha = time !== undefined
      ? sinLerp(time, phaseOffset, baseAlpha * 0.2, baseAlpha * 1.5)
      : baseAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── Badge Icon (Large 8-pointed Islamic Star) ──

function drawBadgeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, tier: BadgeTier, color: string, time?: number) {
  const style = TIER_STYLE[tier];

  // Scale pulse for animation
  const scale = time !== undefined ? sinLerp(time, 0, 1.0, 1.03) : 1;
  const glowBlur = time !== undefined ? sinLerp(time, 0.5, 40, 60) : 50;

  if (scale !== 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
  }

  // Outer glow (gold tier only)
  if (tier === "gold") {
    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = glowBlur;
    drawStarPath(ctx, cx, cy, r, r * 0.42);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // Circle frame behind the star
  ctx.save();
  const frameR = r + 20;
  ctx.beginPath();
  ctx.arc(cx, cy, frameR, 0, Math.PI * 2);
  ctx.strokeStyle = `${color}25`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Star fill (gradient for gold, subtle for others)
  drawStarPath(ctx, cx, cy, r, r * 0.42);
  if (tier === "gold") {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, `${style.primary}40`);
    grad.addColorStop(0.5, `${style.primary}20`);
    grad.addColorStop(1, `${style.primary}40`);
    ctx.fillStyle = grad;
    ctx.fill();
  } else {
    ctx.fillStyle = `${color}12`;
    ctx.fill();
  }

  // Star stroke
  drawStarPath(ctx, cx, cy, r, r * 0.42);
  ctx.strokeStyle = color;
  ctx.lineWidth = tier === "gold" ? 3.5 : tier === "silver" ? 3 : 2.5;
  ctx.stroke();

  // Inner star (smaller, rotated)
  const innerStarR = r * 0.5;
  const innerStarIR = r * 0.25;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 8); // 22.5 deg rotation
  drawStarPath(ctx, 0, 0, innerStarR, innerStarIR);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = `${color}40`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (scale !== 1) {
    ctx.restore();
  }
}

// ── Corner Accents ──

function drawCornerAccents(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, time?: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = time !== undefined ? sinLerp(time, 0.3, 0.08, 0.16) : 0.12;
  const s = 80;
  const offset = 40;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(offset, offset + s);
  ctx.lineTo(offset, offset);
  ctx.lineTo(offset + s, offset);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - offset - s, offset);
  ctx.lineTo(w - offset, offset);
  ctx.lineTo(w - offset, offset + s);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(offset, h - offset - s);
  ctx.lineTo(offset, h - offset);
  ctx.lineTo(offset + s, h - offset);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - offset - s, h - offset);
  ctx.lineTo(w - offset, h - offset);
  ctx.lineTo(w - offset, h - offset - s);
  ctx.stroke();

  ctx.restore();
}

// ── Render Frame (pure render function, used by both static capture and animation) ──

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  badge: BadgeDefinition,
  format: CaptureFormat,
  time?: number,
): void {
  const { width, height } = DIMENSIONS[format];
  const L = LAYOUT[format];
  const tier = TIER_STYLE[badge.tier];
  const cx = width / 2;

  // 1. Dark gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0a0a0c");
  bg.addColorStop(0.3, "#111114");
  bg.addColorStop(0.7, "#111114");
  bg.addColorStop(1, "#0a0a0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Geometric pattern
  drawGeometricPattern(ctx, width, height, time);

  // 3. Corner accents
  drawCornerAccents(ctx, width, height, tier.primary, time);

  // 4. Radial glow behind badge
  const glowOpacity = time !== undefined ? sinLerp(time, 0.2, 0.7, 1.0) : 1;
  ctx.save();
  ctx.globalAlpha = glowOpacity;
  const glow = ctx.createRadialGradient(cx, L.iconY, 0, cx, L.iconY, 300);
  glow.addColorStop(0, tier.glow);
  glow.addColorStop(0.6, `${tier.primary}08`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, L.iconY - 300, width, 600);
  ctx.restore();

  // 5. Badge icon
  drawBadgeIcon(ctx, cx, L.iconY, L.iconR, badge.tier, tier.primary, time);

  // 6. Sparkles
  drawSparkles(ctx, cx, L.iconY, L.sparkleSpread, tier.primary, time);

  // 7. Tier pill
  ctx.save();
  ctx.font = `bold 24px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tierText = badge.tier.toUpperCase();
  const tierW = ctx.measureText(tierText).width + 48;
  const tierH = 40;
  roundRect(ctx, cx - tierW / 2, L.tierY - tierH / 2, tierW, tierH, tierH / 2);
  ctx.fillStyle = `${tier.primary}25`;
  ctx.fill();
  ctx.strokeStyle = `${tier.primary}50`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = tier.primary;
  ctx.fillText(tierText, cx, L.tierY);
  ctx.restore();

  // 8. HUGE title
  ctx.save();
  ctx.font = `900 88px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, badge.title.toUpperCase(), cx, width - 160, 100, L.titleY);
  ctx.restore();

  // 9. Subtitle
  ctx.save();
  ctx.font = `500 32px ${FONT}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, badge.subtitle, cx, width - 120, 42, L.subtitleY);
  ctx.restore();

  // 10. Gold accent line with shimmer
  ctx.save();
  if (time !== undefined) {
    // Animated shimmer: bright spot slides L→R
    const shimmerPos = time % 1; // 0→1 linear
    const lineGrad = ctx.createLinearGradient(cx - 140, 0, cx + 140, 0);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(Math.max(0, shimmerPos - 0.15), `${tier.primary}30`);
    lineGrad.addColorStop(shimmerPos, tier.primary);
    lineGrad.addColorStop(Math.min(1, shimmerPos + 0.15), `${tier.primary}30`);
    lineGrad.addColorStop(1, "transparent");
    ctx.fillStyle = lineGrad;
  } else {
    const lineGrad = ctx.createLinearGradient(cx - 140, 0, cx + 140, 0);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.2, `${tier.primary}40`);
    lineGrad.addColorStop(0.5, tier.primary);
    lineGrad.addColorStop(0.8, `${tier.primary}40`);
    lineGrad.addColorStop(1, "transparent");
    ctx.fillStyle = lineGrad;
  }
  ctx.fillRect(cx - 140, L.lineY, 280, 2);
  // Mini stars on the line
  for (let i = -1; i <= 1; i++) {
    drawStarPath(ctx, cx + i * 70, L.lineY + 1, 5, 2, 4);
    ctx.fillStyle = `${tier.primary}60`;
    ctx.fill();
  }
  ctx.restore();

  // 11. Share text (caption)
  ctx.save();
  ctx.font = `italic 26px ${FONT}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  wrapText(ctx, `"${badge.shareText}"`, cx, width - 180, 36, L.captionY);
  ctx.restore();

  // 12. Bottom brand area
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // App name
  ctx.font = `bold 34px ${FONT}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillText("My Ramadan Guide", cx, L.brandY);

  // URL
  ctx.font = `500 24px ${FONT}`;
  ctx.fillStyle = `${tier.primary}90`;
  ctx.fillText(APP_URL, cx, L.brandY + 40);

  // Hashtags
  ctx.font = `600 22px ${FONT}`;
  ctx.fillStyle = `${tier.primary}60`;
  ctx.fillText("#MyRamadanGuide  #Ramadan2026  #Ramadan", cx, L.hashY);
  ctx.restore();
}

// ── Static Image Capture ──

export async function captureBadgeImage(badge: BadgeDefinition, format: CaptureFormat): Promise<Blob> {
  const { width, height } = DIMENSIONS[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  renderFrame(ctx, badge, format);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create image"));
    }, "image/png");
  });
}

// ── Video Capture ──

export interface VideoResult {
  blob: Blob;
  mimeType: string;
  extension: string;
}

export function supportsVideoCapture(): boolean {
  if (typeof MediaRecorder === "undefined") return false;
  const canvas = document.createElement("canvas");
  return typeof canvas.captureStream === "function";
}

function getVideoMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  // Prefer mp4 (Safari), then webm with vp9, then plain webm
  const candidates = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

export async function captureBadgeVideo(
  badge: BadgeDefinition,
  format: CaptureFormat,
  signal?: AbortSignal,
): Promise<VideoResult> {
  const { width, height } = DIMENSIONS[format];
  const mimeType = getVideoMimeType();
  if (!mimeType) throw new Error("No supported video MIME type");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const DURATION_MS = 3000;
  const extension = mimeType.startsWith("video/mp4") ? "mp4" : "webm";

  return new Promise<VideoResult>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const onAbort = () => {
      recorder.stop();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    recorder.onstop = () => {
      signal?.removeEventListener("abort", onAbort);
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, mimeType, extension });
    };

    recorder.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("MediaRecorder error"));
    };

    recorder.start();

    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= DURATION_MS) {
        // Render one final frame at t=0 for seamless loop
        renderFrame(ctx, badge, format, 0);
        recorder.stop();
        return;
      }
      const t = (elapsed % DURATION_MS) / DURATION_MS; // 0..1
      renderFrame(ctx, badge, format, t);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    // Safety: cleanup if abort fires mid-animation
    signal?.addEventListener("abort", () => cancelAnimationFrame(rafId), { once: true });
  });
}
