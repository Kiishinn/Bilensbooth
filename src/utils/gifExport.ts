import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { applyFilter } from '../canvas/filters';
import { FilterType } from '../types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateBoomerangGIF(photos: string[], filter: FilterType): Promise<string> {
  // Use a sensible resolution for GIF to balance quality and rendering speed
  const width = 480;
  const height = 640; // 3:4 portrait
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error("Could not create canvas context");
  
  const gif = GIFEncoder();
  
  // Helper to process and write a single frame
  const processFrame = async (photoUrl: string) => {
    const img = await loadImage(photoUrl);
    
    // Draw image covering the canvas (object-cover style)
    const scale = Math.max(width / img.width, height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (width - drawW) / 2;
    const y = (height - drawH) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, x, y, drawW, drawH);
    
    // Apply filter
    applyFilter(ctx, filter, width, height, width, height);
    
    // Extract pixel data
    const { data } = ctx.getImageData(0, 0, width, height);
    
    // Quantize to 256 colors
    const palette = quantize(data, 256, { format: 'rgba4444' });
    const index = applyPalette(data, palette, 'rgba4444');
    
    // Write frame (400ms delay per frame)
    gif.writeFrame(index, width, height, { palette, delay: 400 });
  };

  // 1. Forward sequence
  for (let i = 0; i < photos.length; i++) {
    await processFrame(photos[i]);
  }
  
  // 2. Backward sequence for boomerang effect (exclude first and last to prevent stuttering delay)
  for (let i = photos.length - 2; i > 0; i--) {
    await processFrame(photos[i]);
  }
  
  gif.finish();
  const buffer = gif.bytesView();
  const blob = new Blob([buffer], { type: 'image/gif' });
  return URL.createObjectURL(blob);
}
