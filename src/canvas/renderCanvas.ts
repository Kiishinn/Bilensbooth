/**
 * BILENS BOOTH — Canvas Rendering Engine
 *
 * Renders photo strips (1×4) and grids (2×2) using raw Canvas API.
 * Features: cover-fit images, film sprocket holes (#2), frame numbers (#10),
 * custom event stamp (#4), filter application, metadata strip.
 */

import type { FilterType, FrameColor, LayoutType } from '../types/index';
import { FRAME_COLOR_HEX } from '../types/index';
import {
  applyBWFilter,
  applySepiaFilter,
  applyCrossFilter,
  applyLomoFilter,
  applyExpiredFilter,
} from './filters';

export interface RenderOptions {
  layout: LayoutType;
  photos: string[];
  filter: FilterType;
  frameColor: FrameColor;
  canvasWidth: number;
  customText?: string;
}

/* ─── Image Loading ─── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Cover-Fit Drawing ─── */

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number
): void {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const destAspect = dw / dh;
  let sx: number, sy: number, sw: number, sh: number;

  if (imgAspect > destAspect) {
    sh = img.naturalHeight;
    sw = sh * destAspect;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / destAspect;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/* ─── Rounded Rectangle ─── */

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ─── Film Sprocket Holes (#2) ─── */

function drawSprocketHoles(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  frameColorHex: string,
  padding: number
): void {
  const holeW = Math.round(canvasWidth * 0.02);
  const holeH = Math.round(holeW * 1.4);
  const spacing = Math.round(holeH * 2.2);
  const edgeMargin = Math.round(padding * 0.3);

  const isDark = frameColorHex === '#1b1c1c' || frameColorHex === '#bb181e';
  const holeColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const holeBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';

  ctx.save();
  ctx.lineWidth = 1;

  for (let y = padding * 0.6; y < canvasHeight - padding * 0.6; y += spacing) {
    // Left sprocket hole
    drawRoundedRect(ctx, edgeMargin, y, holeW, holeH, 2);
    ctx.fillStyle = holeColor;
    ctx.fill();
    ctx.strokeStyle = holeBorder;
    ctx.stroke();

    // Right sprocket hole
    drawRoundedRect(ctx, canvasWidth - edgeMargin - holeW, y, holeW, holeH, 2);
    ctx.fillStyle = holeColor;
    ctx.fill();
    ctx.strokeStyle = holeBorder;
    ctx.stroke();
  }

  ctx.restore();
}

/* ─── Timestamp Formatting ─── */

function formatTimestamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/* ─── Layout Calculation ─── */

interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LayoutResult {
  canvasHeight: number;
  slots: PhotoSlot[];
  metaY: number;
}

function calculateStripLayout(
  canvasWidth: number, photoCount: number,
  padding: number, gap: number, metaHeight: number
): LayoutResult {
  const photoW = canvasWidth - padding * 2;
  const photoH = Math.round(photoW * 0.75);
  const totalPhotosHeight = photoCount * photoH + (photoCount - 1) * gap;
  const canvasHeight = padding + totalPhotosHeight + gap + metaHeight + padding;
  const slots: PhotoSlot[] = [];
  for (let i = 0; i < photoCount; i++) {
    slots.push({
      x: padding,
      y: padding + i * (photoH + gap),
      w: photoW,
      h: photoH,
    });
  }
  return { canvasHeight, slots, metaY: padding + totalPhotosHeight + gap };
}

function calculateGridLayout(
  canvasWidth: number, photoCount: number,
  padding: number, gap: number, metaHeight: number
): LayoutResult {
  const cols = 2;
  const rows = Math.ceil(photoCount / cols);
  const photoW = Math.round((canvasWidth - padding * 2 - (cols - 1) * gap) / cols);
  const photoH = Math.round(photoW * 0.75);
  const totalPhotosHeight = rows * photoH + (rows - 1) * gap;
  const canvasHeight = padding + totalPhotosHeight + gap + metaHeight + padding;
  const slots: PhotoSlot[] = [];
  for (let i = 0; i < photoCount; i++) {
    slots.push({
      x: padding + (i % cols) * (photoW + gap),
      y: padding + Math.floor(i / cols) * (photoH + gap),
      w: photoW,
      h: photoH,
    });
  }
  return { canvasHeight, slots, metaY: padding + totalPhotosHeight + gap };
}

/* ─── Apply Filter to Photo Region ─── */

function applyFilterToRegion(
  ctx: CanvasRenderingContext2D,
  filter: FilterType,
  x: number, y: number, w: number, h: number,
  seed: number
): void {
  switch (filter) {
    case 'bw':
      applyBWFilter(ctx, x, y, w, h);
      break;
    case 'sepia':
      applySepiaFilter(ctx, x, y, w, h, seed);
      break;
    case 'cross':
      applyCrossFilter(ctx, x, y, w, h);
      break;
    case 'lomo':
      applyLomoFilter(ctx, x, y, w, h);
      break;
    case 'expired':
      applyExpiredFilter(ctx, x, y, w, h, seed);
      break;
    case 'raw':
      break;
  }
}

/* ─── Main Render Function ─── */

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { layout, photos, filter, frameColor, canvasWidth, customText } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx || photos.length === 0) return;

  const padding = Math.round(canvasWidth * 0.05);
  const gap = Math.round(canvasWidth * 0.02);
  const metaHeight = Math.round(canvasWidth * 0.09);

  const layoutResult =
    layout === 'strip'
      ? calculateStripLayout(canvasWidth, photos.length, padding, gap, metaHeight)
      : calculateGridLayout(canvasWidth, photos.length, padding, gap, metaHeight);

  const { canvasHeight, slots, metaY } = layoutResult;
  const frameHex = FRAME_COLOR_HEX[frameColor];
  const isDarkFrame = frameColor === 'ink-black' || frameColor === 'blood-red';

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Background
  ctx.fillStyle = frameHex;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Film sprocket holes (strip only)
  if (layout === 'strip') {
    drawSprocketHoles(ctx, canvasWidth, canvasHeight, frameHex, padding);
  }

  // Grain seed: consistent per render dimensions
  const grainSeed = canvasWidth * 7919 + photos.length * 31;

  // Load and draw photos
  const images = await Promise.all(photos.map(loadImage));

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const slot = slots[i];

    ctx.save();
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();

    // Apply filter
    applyFilterToRegion(ctx, filter, slot.x, slot.y, slot.w, slot.h, grainSeed + i * 1000);

    // Frame number overlay (#10)
    const numSize = Math.max(10, Math.round(slot.w * 0.03));
    ctx.save();
    ctx.font = `700 ${numSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(i + 1).padStart(2, '0'), slot.x + slot.w - 8, slot.y + slot.h - 8);
    ctx.restore();
  }

  // Photo borders
  const borderColor = isDarkFrame ? '#fbf9f8' : '#1b1c1c';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  for (const slot of slots) {
    ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
  }

  // ─── Metadata Strip ───
  const textColor = isDarkFrame ? '#fbf9f8' : '#1b1c1c';
  const secondaryColor = isDarkFrame ? 'rgba(251,249,248,0.5)' : 'rgba(27,28,28,0.5)';
  const fontSize = Math.max(14, Math.round(canvasWidth * 0.018));
  const smallFont = Math.max(11, Math.round(canvasWidth * 0.013));

  ctx.save();

  // Decorative line
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, metaY);
  ctx.lineTo(canvasWidth - padding, metaY);
  ctx.stroke();

  const lineY = metaY + Math.round(gap * 0.8);

  // Timestamp
  ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(`WAKTU: ${formatTimestamp(new Date())}`, padding, lineY);

  // Brand or custom text (#4)
  const displayText = customText?.trim() || 'BILENS BOOTH';
  ctx.fillText(displayText.toUpperCase(), padding, lineY + fontSize * 1.6);

  // Right-aligned info
  ctx.font = `400 ${smallFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = secondaryColor;
  ctx.textAlign = 'right';
  ctx.fillText(
    layout === 'strip' ? 'FORMAT: 1×4 STRIP' : 'FORMAT: 2×2 GRID',
    canvasWidth - padding, lineY
  );
  ctx.fillText('ABADIKAN MOMEN SECARA GRATIS', canvasWidth - padding, lineY + smallFont * 1.6);

  ctx.restore();
}
