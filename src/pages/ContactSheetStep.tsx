import { useCallback } from 'react';
import { ArrowRight, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContactSheetStepProps {
  photos: string[];
  selectedIndices: number[];
  onSelectionChange: (indices: number[]) => void;
  onConfirm: () => void;
  onRetake: () => void;
}

export function ContactSheetStep({
  photos,
  selectedIndices,
  onSelectionChange,
  onConfirm,
  onRetake,
}: ContactSheetStepProps) {
  const handleToggle = (index: number) => {
    if (selectedIndices.includes(index)) {
      onSelectionChange(selectedIndices.filter((i) => i !== index));
    } else if (selectedIndices.length < 4) {
      onSelectionChange([...selectedIndices, index]);
    }
  };

  const isComplete = selectedIndices.length === 4;

  // Reorder handlers (#11)
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
    <div className="max-w-4xl mx-auto">
      {/* Title + Counter */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
            Seleksi Foto
          </h2>
          <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
            PILIH 4 FOTO UNTUK DICETAK
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
          /4
        </div>
      </div>

      {/* 6-Photo Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {photos.map((photo, index) => {
          const isSelected = selectedIndices.includes(index);
          const selectionOrder = isSelected ? selectedIndices.indexOf(index) + 1 : null;
          const canSelect = selectedIndices.length < 4;

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
                <div className="absolute top-2 right-2 w-8 h-8 bg-blood-red flex items-center justify-center border-2 border-ink-black">
                  <span className="font-mono text-sm font-bold text-paper-base">{selectionOrder}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-ink-black/70 px-2 py-1 font-mono text-[10px] text-paper-base/70 tracking-widest">
                FOTO {String(index + 1).padStart(2, '0')}
              </div>
              {!isSelected && canSelect && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-ink-black/20">
                  <span className="font-mono text-xs text-paper-base bg-ink-black/80 px-3 py-1">PILIH</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Print Order Reorder Strip (#11) ─── */}
      {isComplete && (
        <div className="mb-8 border-4 border-ink-black/15 p-4 bg-silver-halide/30">
          <h3 className="font-mono text-[10px] text-ink-black/40 tracking-[0.2em] mb-3">
            ▌ URUTAN CETAK — GUNAKAN PANAH UNTUK MENGGESER
          </h3>
          <div className="flex gap-1 sm:gap-2 items-center justify-center flex-wrap">
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
                <div className="w-14 sm:w-16 h-10 sm:h-12 border-2 border-blood-red overflow-hidden relative">
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
