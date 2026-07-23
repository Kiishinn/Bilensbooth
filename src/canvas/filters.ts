/**
 * BILENS BOOTH — Canvas Filter Engine
 *
 * All filters use raw getImageData/putImageData pixel manipulation.
 * NO CSS filters. NO external libraries.
 *
 * Seeded PRNG ensures grain is consistent across re-renders (#8).
 */

import { FilterType } from '../types';

/* ─── Seeded PRNG (Mulberry32) ─── */

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}

/* ─── SILVER B&W ─── */

export function applyBWFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray =
      data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const contrasted = (gray - 128) * 1.2 + 128;
    const c = clamp(contrasted);
    data[i] = c;
    data[i + 1] = c;
    data[i + 2] = c;
  }

  ctx.putImageData(imageData, x, y);
}

/* ─── SEPIA GRAIN ─── */

export function applySepiaFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number
): void {
  const random = mulberry32(seed);
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    let sr = r * 0.393 + g * 0.769 + b * 0.189;
    let sg = r * 0.349 + g * 0.686 + b * 0.168;
    let sb = r * 0.272 + g * 0.534 + b * 0.131;

    sr = (sr - 128) * 1.1 + 128;
    sg = (sg - 128) * 1.1 + 128;
    sb = (sb - 128) * 1.1 + 128;

    const grain = (random() - 0.5) * 30;
    data[i] = clamp(sr + grain);
    data[i + 1] = clamp(sg + grain);
    data[i + 2] = clamp(sb + grain);
  }

  ctx.putImageData(imageData, x, y);
}

/* ─── CROSS PROCESS ─── */

export function applyCrossFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // Push green/cyan tones
    r = clamp(r * 0.9 + 20);
    g = clamp(g * 1.15 + 10);
    b = clamp(b * 0.8 + 30);

    // Contrast boost per channel
    r = clamp((r - 128) * 1.3 + 128);
    g = clamp((g - 128) * 1.2 + 128);
    b = clamp((b - 128) * 1.1 + 128);

    // Saturation boost
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const sat = 1.3;
    r = clamp(gray + (r - gray) * sat);
    g = clamp(gray + (g - gray) * sat);
    b = clamp(gray + (b - gray) * sat);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, x, y);
}

/* ─── LOMO ─── */

export function applyLomoFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // Warm tones
    r = clamp(r * 1.1 + 10);
    b = clamp(b * 0.85);

    // High contrast
    r = clamp((r - 128) * 1.4 + 128);
    g = clamp((g - 128) * 1.4 + 128);
    b = clamp((b - 128) * 1.4 + 128);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, x, y);

  // Heavy vignette
  applyVignette(ctx, x, y, width, height, 0.45);
}

/* ─── EXPIRED FILM ─── */

export function applyExpiredFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number
): void {
  const random = mulberry32(seed);
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // Color shift toward magenta/warm
    r = clamp(r * 1.05 + 15);
    g = clamp(g * 0.92);
    b = clamp(b * 0.95 + 8);

    // Slight desaturation
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    r = clamp(gray + (r - gray) * 0.8);
    g = clamp(gray + (g - gray) * 0.8);
    b = clamp(gray + (b - gray) * 0.8);

    // Film grain
    const grain = (random() - 0.5) * 20;
    data[i] = clamp(r + grain);
    data[i + 1] = clamp(g + grain);
    data[i + 2] = clamp(b + grain);
  }

  ctx.putImageData(imageData, x, y);

  // Light leak from top-left corner
  applyLightLeak(ctx, x, y, width, height);
}

/* ─── Post-Processing Effects ─── */

function applyVignette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  intensity: number
): void {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const radius = Math.sqrt(w * w + h * h) / 2;

  const gradient = ctx.createRadialGradient(
    cx, cy, radius * 0.35,
    cx, cy, radius
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function applyLightLeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const gradient = ctx.createLinearGradient(x, y, x + w * 0.7, y + h * 0.7);
  gradient.addColorStop(0, 'rgba(255, 140, 50, 0.25)');
  gradient.addColorStop(0.4, 'rgba(255, 200, 80, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* ─── NEW FILTERS: LIGHT LEAK & PAPER ─── */

export function applyLightLeakFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Base contrast boost
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    r = clamp((r - 128) * 1.1 + 128);
    g = clamp((g - 128) * 1.1 + 128);
    b = clamp((b - 128) * 1.1 + 128);
    data[i] = r; data[i+1] = g; data[i+2] = b;
  }
  ctx.putImageData(imageData, x, y);
  
  // Apply an intense red/orange light leak on the left and right edges
  const leftGradient = ctx.createLinearGradient(x, y, x + width * 0.4, y);
  leftGradient.addColorStop(0, 'rgba(255, 60, 0, 0.4)');
  leftGradient.addColorStop(1, 'rgba(255, 60, 0, 0)');
  
  const rightGradient = ctx.createLinearGradient(x + width, y + height, x + width * 0.5, y);
  rightGradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
  rightGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = leftGradient;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = rightGradient;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

export function applyPaperFilter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number
): void {
  const random = mulberry32(seed);
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  // Add severe grain and lower contrast (matte paper look)
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    
    // Lower contrast
    r = (r - 128) * 0.8 + 128 + 10;
    g = (g - 128) * 0.8 + 128 + 10;
    b = (b - 128) * 0.8 + 128 + 10;

    // Heavy grain
    const grain = (random() - 0.5) * 40;
    data[i] = clamp(r + grain);
    data[i+1] = clamp(g + grain);
    data[i+2] = clamp(b + grain);
  }
  ctx.putImageData(imageData, x, y);
}

/* ─── CENTRAL FILTER ROUTER ─── */
export function applyFilter(
  ctx: CanvasRenderingContext2D,
  filter: FilterType,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number = 12345
) {
  if (filter === 'raw') return;
  
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
    case 'lightleak':
      applyLightLeakFilter(ctx, x, y, w, h);
      break;
    case 'paper':
      applyPaperFilter(ctx, x, y, w, h, seed);
      break;
  }
}
