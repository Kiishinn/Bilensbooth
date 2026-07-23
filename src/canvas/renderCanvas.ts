/**
 * BILENS BOOTH — Canvas Rendering Engine
 *
 * Renders photo strips (1×4) and grids (2×2) using raw Canvas API.
 * Features: cover-fit images, film sprocket holes (#2), frame numbers (#10),
 * custom event stamp (#4), filter application, metadata strip.
 */

import type { FilterType, LayoutType } from '../types/index';
import { GRAPHIC_TEMPLATES } from '../utils/frameRegistry';
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
  frameId: string;
  canvasWidth: number;
  customText?: string;
  stickers?: import('../types/index').StickerData[];
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
  padding: number
): void {
  const holeW = Math.round(canvasWidth * 0.02);
  const holeH = Math.round(holeW * 1.4);
  const spacing = Math.round(holeH * 2.2);
  const edgeMargin = Math.round(padding * 0.3);

  const holeColor = 'rgba(255,255,255,0.07)';
  const holeBorder = 'rgba(255,255,255,0.14)';

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

function calculatePolaroidLayout(
  canvasWidth: number, _photoCount: number,
  padding: number, gap: number, metaHeight: number
): LayoutResult {
  const photoW = canvasWidth - padding * 2;
  const photoH = Math.round(photoW * 0.75);
  // Extra bottom space for classic polaroid look
  const canvasHeight = padding + photoH + metaHeight * 2.5 + padding; 
  const slots: PhotoSlot[] = [{
    x: padding,
    y: padding,
    w: photoW,
    h: photoH,
  }];
  return { canvasHeight, slots, metaY: padding + photoH + gap * 2 };
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
  const { layout, photos, filter, frameId, canvasWidth, customText } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx || photos.length === 0) return;

  const padding = Math.round(canvasWidth * 0.05);
  const gap = Math.round(canvasWidth * 0.02);
  const metaHeight = Math.round(canvasWidth * 0.09);

  let layoutResult: LayoutResult;
  if (layout === 'strip-3') {
    layoutResult = calculateStripLayout(canvasWidth, 3, padding, gap, metaHeight);
  } else if (layout === 'strip-4') {
    layoutResult = calculateStripLayout(canvasWidth, 4, padding, gap, metaHeight);
  } else if (layout === 'polaroid-1') {
    layoutResult = calculatePolaroidLayout(canvasWidth, 1, padding, gap, metaHeight);
  } else {
    layoutResult = calculateGridLayout(canvasWidth, 4, padding, gap, metaHeight);
  }

  const { canvasHeight, slots, metaY } = layoutResult;
  const template = GRAPHIC_TEMPLATES.find(t => t.id === frameId) || GRAPHIC_TEMPLATES[0];
  const isDarkFrame = template.theme === 'dark';

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Grain seed: consistent per render dimensions
  const grainSeed = canvasWidth * 7919 + photos.length * 31;

  // 1. Draw solid white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw Template Frame 
  const templateImg = await loadImage(template.url);
  ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);

  // 3. Draw extras (sprocket holes, borders)
  if (layout.startsWith('strip')) {
    drawSprocketHoles(ctx, canvasWidth, canvasHeight, padding);
  }

  // 4. Load and draw photos ON TOP
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
  let layoutName = 'FORMAT: 2×2 GRID';
  if (layout === 'strip-3') layoutName = 'FORMAT: 1×3 STRIP';
  else if (layout === 'strip-4') layoutName = 'FORMAT: 1×4 STRIP';
  else if (layout === 'polaroid-1') layoutName = 'FORMAT: 1×1 POLAROID';

  ctx.fillText(layoutName, canvasWidth - padding, lineY);
  ctx.fillText('MAKE THE MOMENT FOR FREE', canvasWidth - padding, lineY + smallFont * 1.6);

  // Outer border
  ctx.strokeStyle = '#1b1c1c';
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();

  // ─── Draw Stickers ───
  if (options.stickers && options.stickers.length > 0) {
    for (const sticker of options.stickers) {
      try {
        const stickerImg = await loadImage(sticker.url);
        const drawX = sticker.x * canvasWidth;
        const drawY = sticker.y * canvasHeight;
        
        const baseSize = canvasWidth * 0.25;
        const finalSize = baseSize * sticker.scale;
        
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.drawImage(
          stickerImg,
          -finalSize / 2,
          -finalSize / 2,
          finalSize,
          finalSize
        );
        ctx.restore();
      } catch (err) {
        console.warn('Failed to draw sticker:', sticker.url, err);
      }
    }
  }
}
