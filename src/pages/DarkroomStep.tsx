import { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Frame, Palette, Type, Wand2 } from 'lucide-react';
import type { LayoutType, FilterType, StickerData } from '../types/index';
import { FILTER_LABELS } from '../types/index';
import { GRAPHIC_TEMPLATES } from '../utils/frameRegistry';
import { STICKER_TEMPLATES } from '../utils/stickerRegistry';
import { renderToCanvas } from '../canvas/renderCanvas';
import { DraggableSticker } from '../components/DraggableSticker';

interface DarkroomStepProps {
  layout: LayoutType;
  photos: string[];
  filter: FilterType;
  frameId: string;
  customText: string;
  stickers: StickerData[];
  onFilterChange: (filter: FilterType) => void;
  onFrameIdChange: (id: string) => void;
  onCustomTextChange: (text: string) => void;
  onStickersChange: (stickers: StickerData[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const FILTERS: FilterType[] = ['raw', 'bw', 'sepia', 'cross', 'lomo', 'expired'];
type TabType = 'frame' | 'filter' | 'text' | 'stickers';

export function DarkroomStep({
  layout, photos, filter, frameId, customText, stickers,
  onFilterChange, onFrameIdChange, onCustomTextChange, onStickersChange,
  onConfirm, onBack,
}: DarkroomStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [isRendering, setIsRendering] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('frame');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current || photos.length === 0) return;
    setIsRendering(true);
    try {
      // We do not pass stickers here, because stickers are rendered as DOM elements in the preview!
      // They are only rendered onto the canvas during ExportStep.
      await renderToCanvas(canvasRef.current, {
        layout, photos, filter, frameId, canvasWidth: 600, customText,
      });
    } finally {
      setIsRendering(false);
    }
  }, [layout, photos, filter, frameId, customText]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateCanvas();
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [updateCanvas]);

  const handleAddSticker = (url: string) => {
    const newSticker: StickerData = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url,
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0
    };
    onStickersChange([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerData>) => {
    onStickersChange(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteSticker = (id: string) => {
    onStickersChange(stickers.filter(s => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  return (
    <div className="max-w-6xl mx-auto" onClick={() => setSelectedStickerId(null)}>
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Lab Foto
        </h2>
        <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
          SESUAIKAN HASIL AKHIR SEBELUM DICETAK
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Canvas & Stickers Preview */}
        <div className="relative flex justify-center items-center bg-silver-halide p-2 sm:p-4 border-4 border-ink-black hard-shadow">
          <div className="relative shadow-2xl w-fit h-fit mx-auto" ref={containerRef}>
            <canvas ref={canvasRef} className="block max-h-[65vh] lg:max-h-[80vh] w-auto max-w-full object-contain" aria-label="Photo print preview" />
            
            {/* Interactive Stickers Overlay */}
            {stickers.map(sticker => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                isSelected={selectedStickerId === sticker.id}
                onSelect={setSelectedStickerId}
                onUpdate={handleUpdateSticker}
                onDelete={handleDeleteSticker}
                containerRef={containerRef}
              />
            ))}

            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-black/30 backdrop-blur-sm z-50">
                <span className="font-mono text-xs text-paper-base bg-ink-black px-4 py-2 tracking-widest animate-pulse">
                  MEMPROSES...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Controls Panel */}
        <div className="flex flex-col gap-4" onClick={e => e.stopPropagation()}>
          {/* Tabs Navigation */}
          <div className="flex bg-paper-base border-4 border-ink-black p-1 hard-shadow-sm">
            {[
              { id: 'frame', icon: Frame, label: 'BINGKAI' },
              { id: 'filter', icon: Palette, label: 'FILTER' },
              { id: 'stickers', icon: Wand2, label: 'STIKER' },
              { id: 'text', icon: Type, label: 'TEKS' },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 font-mono text-[9px] font-bold tracking-widest transition-colors ${
                    activeTab === tab.id ? 'bg-blood-red text-white' : 'hover:bg-ink-black/5 text-ink-black/60'
                  }`}
                >
                  <Icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-paper-base border-4 border-ink-black p-5 hard-shadow-sm overflow-y-auto h-[50vh] lg:h-[65vh] custom-scrollbar">
            {activeTab === 'frame' && (
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] font-bold text-ink-black/40 tracking-[0.2em]">PILIHAN BINGKAI GRAFIS</h3>
                <div className="grid grid-cols-2 gap-3 p-1">
                  {GRAPHIC_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => onFrameIdChange(tmpl.id)}
                      className={`relative w-full aspect-[2/3] flex flex-col items-center justify-end border-4 transition-all duration-200 bg-[#f4f4f5] group overflow-hidden ${
                        frameId === tmpl.id ? 'border-blood-red scale-[1.02] shadow-[4px_4px_0px_#bb181e] z-10' : 'border-ink-black/10 hover:border-ink-black/30 hover:bg-[#e4e4e7]'
                      }`}
                    >
                      {/* Checkerboard pattern to show transparent frame cutouts */}
                      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]" />
                      
                      <img src={tmpl.url} alt={tmpl.name} className="absolute inset-0 w-full h-full p-2 object-contain pointer-events-none drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
                      
                      {frameId === tmpl.id && (
                        <div className="absolute top-2 right-2 bg-blood-red text-white p-1 rounded-full z-10 shadow-sm"><Check size={14} strokeWidth={4} /></div>
                      )}
                      
                      <div className="relative w-full bg-ink-black/95 backdrop-blur-md pt-2 pb-1.5 z-10 border-t border-ink-black/20">
                        <span className="font-mono text-[9px] font-bold text-white block text-center truncate px-2 tracking-widest">{tmpl.name.toUpperCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'filter' && (
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] font-bold text-ink-black/40 tracking-[0.2em]">PILIHAN FILTER KAMERA</h3>
                <div className="grid grid-cols-1 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => onFilterChange(f)}
                      className={`flex items-center justify-between px-4 py-3 border-2 font-mono text-xs uppercase transition-all duration-150 tracking-wider ${
                        filter === f ? 'border-blood-red bg-blood-red/5 text-blood-red font-bold' : 'border-ink-black/20 hover:border-ink-black/50 text-ink-black'
                      }`}
                    >
                      <span className="truncate">{FILTER_LABELS[f]}</span>
                      {filter === f && <Check size={14} strokeWidth={3} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] font-bold text-ink-black/40 tracking-[0.2em]">TAMBAHKAN STIKER</h3>
                <div className="grid grid-cols-3 gap-3">
                  {STICKER_TEMPLATES.map((stk) => (
                    <button
                      key={stk.id}
                      onClick={() => handleAddSticker(stk.url)}
                      className="aspect-square flex items-center justify-center border-2 border-ink-black/10 hover:border-ink-black hover:bg-ink-black/5 transition-colors p-3"
                    >
                      <img src={stk.url} alt={stk.name} className="w-full h-full object-contain pointer-events-none drop-shadow-sm" />
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blood-red/10 border border-blood-red/30 rounded text-center">
                  <p className="font-mono text-[9px] text-blood-red tracking-wider">
                    Ketuk stiker untuk menambahkan. Seret untuk memindahkan, gunakan tombol untuk mengubah ukuran/memutar.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] font-bold text-ink-black/40 tracking-[0.2em]">TEKS ACARA (WATERMARK)</h3>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => onCustomTextChange(e.target.value)}
                  placeholder="MASUKKAN NAMA ACARA..."
                  maxLength={40}
                  className="w-full px-4 py-3 border-2 border-ink-black/20 font-mono text-xs uppercase bg-white focus:border-blood-red outline-none tracking-wider placeholder:text-ink-black/20"
                />
                <p className="font-mono text-[9px] text-ink-black/40 leading-relaxed tracking-wider">
                  Teks ini akan dicetak pada bagian bawah foto. Biarkan kosong untuk menggunakan teks bawaan "BILENS BOOTH". ({customText.length}/40 karakter)
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-3 bg-kodak-yellow text-ink-black font-mono text-sm px-6 py-4 uppercase border-4 border-ink-black btn-interact font-bold tracking-wider"
            >
              SELESAI & SIMPAN
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 bg-paper-base text-ink-black font-mono text-xs px-6 py-3 uppercase border-4 border-ink-black btn-interact tracking-wider"
            >
              <ArrowLeft size={14} />
              KEMBALI KE SELEKSI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
