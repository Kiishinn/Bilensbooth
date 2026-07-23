import { useCallback, useEffect } from 'react';
import { ArrowRight, RotateCcw, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import type { LayoutType } from '../types/index';

interface ContactSheetStepProps {
  photos: string[];
  selectedIndices: number[];
  layout: LayoutType;
  onLayoutSelect: (layout: LayoutType) => void;
  onSelectionChange: (indices: number[]) => void;
  onConfirm: () => void;
  onRetake: () => void;
}

export function ContactSheetStep({
  photos,
  selectedIndices,
  layout,
  onLayoutSelect,
  onSelectionChange,
  onConfirm,
  onRetake,
}: ContactSheetStepProps) {
  
  // Determine how many photos we need based on the layout
  const getRequiredCount = (l: LayoutType) => {
    switch(l) {
      case 'strip-3': return 3;
      case 'polaroid-1': return 1;
      case 'strip-4': 
      case 'grid-4': 
      default: return 4;
    }
  };
  
  const requiredCount = getRequiredCount(layout);
  const isComplete = selectedIndices.length === requiredCount;

  // Auto-switch layout if there are not enough photos for the current layout
  useEffect(() => {
    if (photos.length < requiredCount) {
      let fallback: LayoutType = 'polaroid-1';
      if (photos.length >= 3) fallback = 'strip-3';
      if (photos.length >= 4) fallback = 'strip-4';
      if (layout !== fallback) {
        onLayoutSelect(fallback);
      }
    }
  }, [photos.length, requiredCount, layout, onLayoutSelect]);

  // Auto-trim selection if layout changes to one requiring fewer photos
  const handleLayoutChange = (newLayout: LayoutType) => {
    onLayoutSelect(newLayout);
    const newReq = getRequiredCount(newLayout);
    if (selectedIndices.length > newReq) {
      onSelectionChange(selectedIndices.slice(0, newReq));
    }
  };

  const handleToggle = (index: number) => {
    if (selectedIndices.includes(index)) {
      onSelectionChange(selectedIndices.filter((i) => i !== index));
    } else if (selectedIndices.length < requiredCount) {
      onSelectionChange([...selectedIndices, index]);
    }
  };

  const handleMoveLeft = useCallback(
    (orderIdx: number) => {
      if (orderIdx === 0) return;
      const next = [...selectedIndices];
      [next[orderIdx - 1], next[orderIdx]] = [next[orderIdx], next[orderIdx - 1]];
      onSelectionChange(next);
    },
    [selectedIndices, onSelectionChange]
  );

  const handleMoveRight = useCallback(
    (orderIdx: number) => {
      if (orderIdx === selectedIndices.length - 1) return;
      const next = [...selectedIndices];
      [next[orderIdx], next[orderIdx + 1]] = [next[orderIdx + 1], next[orderIdx]];
      onSelectionChange(next);
    },
    [selectedIndices, onSelectionChange]
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Title + Counter */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
            Seleksi Foto
          </h2>
          <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
            TENTUKAN LAYOUT & PILIH FOTO TERBAIK ANDA
          </p>
        </div>
        <div
          className={[
            'font-mono text-sm border-4 px-5 py-3 hard-shadow-sm bg-paper-base transition-colors duration-200 tracking-wider',
            isComplete ? 'border-blood-red' : 'border-ink-black',
          ].join(' ')}
        >
          FOTO TERPILIH:{' '}
          <span className={['font-bold', isComplete ? 'text-blood-red' : 'text-ink-black'].join(' ')}>
            {selectedIndices.length}
          </span>
          /{requiredCount}
        </div>
      </div>

      {/* Layout Selection */}
      <div className="mb-8 p-4 sm:p-6 border-4 border-ink-black bg-white hard-shadow-sm">
        <h3 className="font-mono text-[10px] text-ink-black/50 tracking-widest mb-4 flex items-center gap-2">
          <LayoutGrid size={14} />
          PILIH FORMAT CETAK:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'strip-3', label: 'STRIP', sub: '1x3' },
            { id: 'strip-4', label: 'STRIP', sub: '1x4' },
            { id: 'grid-4', label: 'GRID', sub: '2x2' },
            { id: 'polaroid-1', label: 'POLAROID', sub: '1x1' }
          ].map((l) => {
            const req = getRequiredCount(l.id as LayoutType);
            const isDisabled = photos.length < req;
            const renderLayoutIcon = (id: string, active: boolean, disabled: boolean) => {
              const baseColor = active ? 'border-blood-red bg-blood-red/20' : disabled ? 'border-ink-black/20 bg-ink-black/5' : 'border-ink-black/40 bg-ink-black/10';
              if (id === 'strip-3') return (
                <div className="flex flex-col gap-[2px] w-4">
                  {[1,2,3].map(i => <div key={i} className={`w-full h-3 border ${baseColor}`} />)}
                </div>
              );
              if (id === 'strip-4') return (
                <div className="flex flex-col gap-[2px] w-4">
                  {[1,2,3,4].map(i => <div key={i} className={`w-full h-3 border ${baseColor}`} />)}
                </div>
              );
              if (id === 'grid-4') return (
                <div className="grid grid-cols-2 gap-[2px] w-8">
                  {[1,2,3,4].map(i => <div key={i} className={`w-full h-3 border ${baseColor}`} />)}
                </div>
              );
              if (id === 'polaroid-1') return (
                <div className={`w-8 h-10 border flex flex-col items-center pt-1 ${baseColor}`}>
                  <div className={`w-6 h-6 border ${active ? 'border-blood-red bg-blood-red/10' : 'border-ink-black/20 bg-white'}`} />
                </div>
              );
              return null;
            };

            return (
              <button
                key={l.id}
                onClick={() => !isDisabled && handleLayoutChange(l.id as LayoutType)}
                disabled={isDisabled}
                className={`p-3 border-2 font-mono transition-all flex flex-col items-center justify-between min-h-[120px] ${
                  layout === l.id 
                    ? 'border-blood-red bg-blood-red/10 text-blood-red font-bold' 
                    : isDisabled 
                      ? 'border-ink-black/10 opacity-30 cursor-not-allowed'
                      : 'border-ink-black/20 hover:border-ink-black cursor-pointer bg-white'
                }`}
              >
                <div className="flex-1 flex items-center justify-center pointer-events-none">
                  {renderLayoutIcon(l.id, layout === l.id, isDisabled)}
                </div>
                <div className="mt-3 pointer-events-none">
                  <div className="text-xs">{l.label}</div>
                  <div className="text-[9px] opacity-70 mt-0.5 tracking-widest">{l.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {photos.map((photo, index) => {
          const isSelected = selectedIndices.includes(index);
          const selectionOrder = isSelected ? selectedIndices.indexOf(index) + 1 : null;
          const canSelect = selectedIndices.length < requiredCount;

          return (
            <button
              key={index}
              onClick={() => handleToggle(index)}
              disabled={!isSelected && !canSelect}
              className={[
                'relative border-4 overflow-hidden transition-all duration-200 cursor-pointer group',
                isSelected
                  ? 'border-blood-red hard-shadow'
                  : canSelect
                    ? 'border-ink-black/20 opacity-50 grayscale hover:opacity-75 hover:grayscale-[50%] hover:border-ink-black/40'
                    : 'border-ink-black/10 opacity-30 grayscale cursor-not-allowed',
              ].join(' ')}
              aria-label={`Photo ${index + 1}${isSelected ? `, selected as number ${selectionOrder}` : ', not selected'}`}
              aria-pressed={isSelected}
            >
              <img
                src={photo}
                alt={`Captured photo ${index + 1}`}
                className="w-full aspect-[4/3] object-cover"
              />
              {isSelected && selectionOrder !== null && (
                <div className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blood-red flex items-center justify-center border-2 border-ink-black">
                  <span className="font-mono text-xs sm:text-sm font-bold text-paper-base">{selectionOrder}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-ink-black/70 px-2 py-1 font-mono text-[8px] sm:text-[10px] text-paper-base/70 tracking-widest text-left">
                FOTO {String(index + 1).padStart(2, '0')}
              </div>
              {!isSelected && canSelect && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-ink-black/20">
                  <span className="font-mono text-[10px] sm:text-xs text-paper-base bg-ink-black/80 px-2 py-1">PILIH</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Print Order Reorder Strip */}
      {isComplete && (
        <div className="mb-8 border-4 border-ink-black/15 p-4 bg-silver-halide/30">
          <h3 className="font-mono text-[10px] text-ink-black/40 tracking-[0.2em] mb-3">
            ▌ URUTAN CETAK — GUNAKAN PANAH UNTUK MENGGESER
          </h3>
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
            {selectedIndices.map((photoIdx, orderIdx) => (
              <div key={`order-${photoIdx}`} className="flex items-center gap-0.5 sm:gap-1">
                <button
                  onClick={() => handleMoveLeft(orderIdx)}
                  disabled={orderIdx === 0}
                  className="font-mono text-xs p-1 sm:p-1.5 border border-ink-black/30 disabled:opacity-20 hover:bg-ink-black hover:text-paper-base transition-colors cursor-pointer"
                  aria-label={`Move position ${orderIdx + 1} left`}
                >
                  <ChevronLeft size={12} />
                </button>
                <div className="w-12 sm:w-16 h-9 sm:h-12 border-2 border-blood-red overflow-hidden relative">
                  <img
                    src={photos[photoIdx]}
                    className="w-full h-full object-cover"
                    alt={`Print position ${orderIdx + 1}`}
                  />
                  <div className="absolute top-0 left-0 bg-blood-red text-paper-base font-mono text-[9px] px-1 leading-tight">
                    {orderIdx + 1}
                  </div>
                </div>
                <button
                  onClick={() => handleMoveRight(orderIdx)}
                  disabled={orderIdx === selectedIndices.length - 1}
                  className="font-mono text-xs p-1 sm:p-1.5 border border-ink-black/30 disabled:opacity-20 hover:bg-ink-black hover:text-paper-base transition-colors cursor-pointer"
                  aria-label={`Move position ${orderIdx + 1} right`}
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 bg-paper-base text-ink-black font-mono text-sm px-6 py-4 uppercase border-4 border-ink-black btn-interact tracking-wider"
          aria-label="Retake all photos"
        >
          <RotateCcw size={16} />
          FOTO ULANG
        </button>
        <button
          onClick={onConfirm}
          disabled={!isComplete}
          className="flex items-center justify-center gap-3 bg-ink-black text-paper-base font-mono text-sm px-8 py-4 uppercase border-4 border-ink-black btn-interact tracking-wider"
          aria-label="Proceed to darkroom"
        >
          MASUK LAB FOTO
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
