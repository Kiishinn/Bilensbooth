import { useRef, useEffect, useState, useCallback } from 'react';
import { Download, RotateCcw, ArrowLeft, Share2 } from 'lucide-react';
import type { LayoutType, FilterType, FrameColor } from '../types/index';
import { renderToCanvas } from '../canvas/renderCanvas';
import { saveSession, createThumbnail } from '../utils/sessions';

interface ExportStepProps {
  layout: LayoutType;
  photos: string[];
  filter: FilterType;
  frameColor: FrameColor;
  customText: string;
  onStartOver: () => void;
  onBack: () => void;
}

export function ExportStep({
  layout, photos, filter, frameColor, customText,
  onStartOver, onBack,
}: ExportStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const savedRef = useRef(false);
  const [isRendering, setIsRendering] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  // Check Web Share API support (#5)
  useEffect(() => {
    setShareSupported(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  const renderHighRes = useCallback(async () => {
    if (!canvasRef.current || photos.length === 0) return;
    setIsRendering(true);
    setIsReady(false);
    try {
      await renderToCanvas(canvasRef.current, {
        layout, photos, filter, frameColor, canvasWidth: 1200, customText,
      });
      setIsReady(true);
    } finally {
      setIsRendering(false);
    }
  }, [layout, photos, filter, frameColor, customText]);

  useEffect(() => {
    renderHighRes();
  }, [renderHighRes]);

  // Auto-save session to archive (#15)
  useEffect(() => {
    if (isReady && canvasRef.current && !savedRef.current) {
      savedRef.current = true;
      const thumbnail = createThumbnail(canvasRef.current);
      saveSession({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        thumbnailDataUrl: thumbnail,
        layout,
        filter,
        frameColor,
        customText: customText || '',
      });
    }
  }, [isReady, layout, filter, frameColor, customText]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `bilens-booth-${timestamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Web Share API (#5)
  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, 'image/png')
      );
      if (!blob) return;

      const file = new File([blob], 'bilens-booth.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: customText?.trim() || 'Bilens Booth',
          text: 'Dibuat dengan Bilens Booth — Make the moment for free',
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback: share without file
        const dataUrl = canvasRef.current!.toDataURL('image/png');
        await navigator.share({
          title: customText?.trim() || 'Bilens Booth',
          text: 'Dibuat dengan Bilens Booth — Make the moment for free',
          url: dataUrl,
        });
      }
    } catch (err) {
      // User cancelled or share failed
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, [customText]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Simpan & Bagikan
        </h2>
        <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
          {isRendering
            ? 'MEMPROSES FOTO RESOLUSI TINGGI...'
            : 'FOTO SIAP — UNDUH ATAU BAGIKAN HASILNYA'}
        </p>
      </div>

      {/* High-Res Canvas */}
      <div className="border-4 border-ink-black hard-shadow bg-silver-halide p-3 sm:p-5 mb-8 relative">
        <canvas
          ref={canvasRef}
          className={[
            'w-full h-auto block transition-opacity duration-500',
            isReady ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-label="Final high-resolution photo print"
        />
        {isRendering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 m-3 sm:m-5">
            <div className="w-10 h-10 border-4 border-ink-black border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-ink-black/60 tracking-widest">■ MEMPROSES FOTO...</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-paper-base text-ink-black font-mono text-xs px-5 py-3 uppercase border-4 border-ink-black btn-interact tracking-wider"
            aria-label="Go back to darkroom"
          >
            <ArrowLeft size={14} />
            KEMBALI
          </button>
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 bg-paper-base text-ink-black font-mono text-xs px-5 py-3 uppercase border-4 border-ink-black btn-interact tracking-wider"
            aria-label="Start over"
          >
            <RotateCcw size={14} />
            MULAI DARI AWAL
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Web Share (#5) */}
          {shareSupported && (
            <button
              onClick={handleShare}
              disabled={!isReady}
              className="flex items-center justify-center gap-2 bg-paper-base text-ink-black font-mono text-sm px-6 py-4 uppercase border-4 border-ink-black btn-interact tracking-wider"
              aria-label="Share photo"
            >
              <Share2 size={18} />
              BAGIKAN
            </button>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!isReady}
            className="flex items-center justify-center gap-3 bg-kodak-yellow text-ink-black font-mono text-sm sm:text-base px-8 sm:px-12 py-4 sm:py-5 uppercase border-4 border-ink-black btn-interact font-bold tracking-wider"
            aria-label="Download photo as PNG"
          >
            <Download size={20} strokeWidth={2.5} />
            UNDUH FOTO
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 border-4 border-ink-black/15 p-4 font-mono text-[10px] text-ink-black/35 uppercase tracking-wider leading-relaxed">
        <span className="text-blood-red font-bold">■ PEMBERITAHUAN PRIVASI:</span>{' '}
        FOTO INI DIPROSES SEPENUHNYA DI BROWSER ANDA. TIDAK ADA DATA YANG DIKIRIM KE
        SERVER MANAPUN. FOTO ANDA TETAP BERADA DI PERANGKAT INI. TANPA PELACAKAN.
        TANPA ANALITIK. TANPA UNGGAHAN.
      </div>
    </div>
  );
}
