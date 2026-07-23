import { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { LayoutType, FilterType, FrameColor } from '../types/index';
import {
  FRAME_COLOR_HEX,
  FRAME_COLOR_LABELS,
  FILTER_LABELS,
} from '../types/index';
import { renderToCanvas } from '../canvas/renderCanvas';

interface DarkroomStepProps {
  layout: LayoutType;
  photos: string[];
  filter: FilterType;
  frameColor: FrameColor;
  customText: string;
  onFilterChange: (filter: FilterType) => void;
  onFrameColorChange: (color: FrameColor) => void;
  onCustomTextChange: (text: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const FRAME_COLORS: FrameColor[] = ['paper-base', 'ink-black', 'blood-red', 'kodak-yellow'];
const FILTERS: FilterType[] = ['raw', 'bw', 'sepia', 'cross', 'lomo', 'expired'];

export function DarkroomStep({
  layout, photos, filter, frameColor, customText,
  onFilterChange, onFrameColorChange, onCustomTextChange,
  onConfirm, onBack,
}: DarkroomStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [isRendering, setIsRendering] = useState(false);

  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current || photos.length === 0) return;
    setIsRendering(true);
    try {
      await renderToCanvas(canvasRef.current, {
        layout, photos, filter, frameColor, canvasWidth: 600, customText,
      });
    } finally {
      setIsRendering(false);
    }
  }, [layout, photos, filter, frameColor, customText]);

  // Debounced re-render (#9)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateCanvas();
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [updateCanvas]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Lab Foto
        </h2>
        <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
          PILIH FILTER DAN WARNA — PRATINJAU AKAN OTOMATIS DIPERBARUI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        {/* Canvas Preview */}
        <div className="relative">
          <div className="border-4 border-ink-black hard-shadow bg-silver-halide p-3 sm:p-5">
            <canvas ref={canvasRef} className="w-full h-auto block" aria-label="Photo print preview" />
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-black/30 m-3 sm:m-5">
                <span className="font-mono text-xs text-paper-base bg-ink-black px-4 py-2 tracking-widest">
                  MEMPROSES...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-5">
          {/* Frame Color (#unchanged) */}
          <div className="border-4 border-ink-black p-4 hard-shadow-sm bg-paper-base">
            <h3 className="font-mono text-[10px] font-bold text-ink-black/40 mb-4 tracking-[0.2em]">
              ▌ WARNA BINGKAI
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FRAME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onFrameColorChange(color)}
                  className={[
                    'relative flex items-center gap-2 px-3 py-2.5 border-2 font-mono text-[10px] uppercase transition-all duration-150 cursor-pointer',
                    frameColor === color
                      ? 'border-blood-red bg-blood-red/5'
                      : 'border-ink-black/20 hover:border-ink-black/50',
                  ].join(' ')}
                  aria-label={`Frame color: ${FRAME_COLOR_LABELS[color]}`}
                  aria-pressed={frameColor === color}
                >
                  <div
                    className="w-4 h-4 border-2 border-ink-black flex-shrink-0"
                    style={{ backgroundColor: FRAME_COLOR_HEX[color] }}
                  />
                  <span className="truncate tracking-wider">{FRAME_COLOR_LABELS[color]}</span>
                  {frameColor === color && <Check size={11} className="text-blood-red flex-shrink-0 ml-auto" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Chemical Filter — now 6 options (#12) */}
          <div className="border-4 border-ink-black p-4 hard-shadow-sm bg-paper-base">
            <h3 className="font-mono text-[10px] font-bold text-ink-black/40 mb-4 tracking-[0.2em]">
              ▌ PILIHAN FILTER
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={[
                    'flex items-center justify-between px-3 py-2.5 border-2 font-mono text-[10px] uppercase transition-all duration-150 cursor-pointer tracking-wider',
                    filter === f
                      ? 'border-blood-red bg-blood-red/5 text-blood-red font-bold'
                      : 'border-ink-black/20 hover:border-ink-black/50 text-ink-black',
                  ].join(' ')}
                  aria-label={`Filter: ${FILTER_LABELS[f]}`}
                  aria-pressed={filter === f}
                >
                  <span className="truncate">{FILTER_LABELS[f]}</span>
                  {filter === f && <Check size={11} strokeWidth={3} className="flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Event Stamp (#4) */}
          <div className="border-4 border-ink-black p-4 hard-shadow-sm bg-paper-base">
            <h3 className="font-mono text-[10px] font-bold text-ink-black/40 mb-4 tracking-[0.2em]">
              ▌ NAMA ACARA
            </h3>
            <input
              type="text"
              value={customText}
              onChange={(e) => onCustomTextChange(e.target.value)}
              placeholder="MASUKKAN NAMA ACARA..."
              maxLength={40}
              className="w-full px-3 py-2.5 border-2 border-ink-black/20 font-mono text-xs uppercase bg-paper-base focus:border-blood-red outline-none tracking-wider placeholder:text-ink-black/20"
              aria-label="Custom event stamp text"
            />
            <p className="font-mono text-[9px] text-ink-black/30 mt-2 tracking-wider">
              DITAMPILKAN DI HASIL AKHIR • BAWAAN: BILENS BOOTH ({customText.length}/40)
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-3 bg-kodak-yellow text-ink-black font-mono text-sm px-6 py-4 uppercase border-4 border-ink-black btn-interact font-bold tracking-wider"
              aria-label="Confirm and proceed to export"
            >
              SELESAI & SIMPAN
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 bg-paper-base text-ink-black font-mono text-xs px-6 py-3 uppercase border-4 border-ink-black btn-interact tracking-wider"
              aria-label="Go back to contact sheet"
            >
              <ArrowLeft size={14} />
              KEMBALI KE SELEKSI FOTO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
