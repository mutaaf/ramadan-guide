import type { BadgeDefinition, BadgeTier } from "./definitions";

export type CaptureFormat = "feed" | "story";

const DIMENSIONS = {
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
export const APP_URL = "ramadancompanion.vercel.app";

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

// ── Geometric Pattern ──

function drawGeometricPattern(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const spacing = 90;
  const outerR = 26;
  const innerR = 11;

  ctx.save();
  ctx.strokeStyle = "#c9a84c";
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.07;

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

function drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number, spread: number, color: string) {
  ctx.save();
  // Outer ring of 4-pointed sparkles
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + 0.3;
    const dist = spread * (0.55 + 0.45 * ((i * 7 + 3) % 10) / 10);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const size = 3 + ((i * 3 + 1) % 6);
    const alpha = 0.15 + 0.35 * ((i * 7) % 10) / 10;

    ctx.globalAlpha = alpha;
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
    ctx.globalAlpha = 0.08 + 0.15 * ((i * 3) % 10) / 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── Badge Icon (Large 8-pointed Islamic Star) ──

function drawBadgeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, tier: BadgeTier, color: string) {
  const style = TIER_STYLE[tier];

  // Outer glow (gold tier only)
  if (tier === "gold") {
    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 50;
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
}

// ── Corner Accents ──

function drawCornerAccents(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.12;
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

// ── Main Capture Function ──

export async function captureBadgeImage(badge: BadgeDefinition, format: CaptureFormat): Promise<Blob> {
  const { width, height } = DIMENSIONS[format];
  const L = LAYOUT[format];
  const tier = TIER_STYLE[badge.tier];
  const cx = width / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 1. Dark gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0a0a0c");
  bg.addColorStop(0.3, "#111114");
  bg.addColorStop(0.7, "#111114");
  bg.addColorStop(1, "#0a0a0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Geometric pattern
  drawGeometricPattern(ctx, width, height);

  // 3. Corner accents
  drawCornerAccents(ctx, width, height, tier.primary);

  // 4. Radial glow behind badge
  const glow = ctx.createRadialGradient(cx, L.iconY, 0, cx, L.iconY, 300);
  glow.addColorStop(0, tier.glow);
  glow.addColorStop(0.6, `${tier.primary}08`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, L.iconY - 300, width, 600);

  // 5. Badge icon
  drawBadgeIcon(ctx, cx, L.iconY, L.iconR, badge.tier, tier.primary);

  // 6. Sparkles
  drawSparkles(ctx, cx, L.iconY, L.sparkleSpread, tier.primary);

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

  // 10. Gold accent line
  ctx.save();
  const lineGrad = ctx.createLinearGradient(cx - 140, 0, cx + 140, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, `${tier.primary}40`);
  lineGrad.addColorStop(0.5, tier.primary);
  lineGrad.addColorStop(0.8, `${tier.primary}40`);
  lineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lineGrad;
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

  // Moon + app name
  ctx.font = `bold 34px ${FONT}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillText("Ramadan Companion", cx, L.brandY);

  // URL
  ctx.font = `500 24px ${FONT}`;
  ctx.fillStyle = `${tier.primary}90`;
  ctx.fillText(APP_URL, cx, L.brandY + 40);

  // Hashtags
  ctx.font = `600 22px ${FONT}`;
  ctx.fillStyle = `${tier.primary}60`;
  ctx.fillText("#RamadanCompanion  #Ramadan2026  #Ramadan", cx, L.hashY);
  ctx.restore();

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create image"));
    }, "image/png");
  });
}
