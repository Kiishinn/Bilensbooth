import { useState, useRef } from 'react';
import { X, RotateCw } from 'lucide-react';
import type { StickerData } from '../types/index';

interface DraggableStickerProps {
  sticker: StickerData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<StickerData>) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function DraggableSticker({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef
}: DraggableStickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startCoords = useRef({ x: sticker.x, y: sticker.y });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.sticker-controls')) return;
    
    e.preventDefault();
    onSelect(sticker.id);
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startCoords.current = { x: sticker.x, y: sticker.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    // Convert pixel delta to percentage delta
    const dxPercent = dx / rect.width;
    const dyPercent = dy / rect.height;
    
    onUpdate(sticker.id, {
      x: Math.max(0, Math.min(1, startCoords.current.x + dxPercent)),
      y: Math.max(0, Math.min(1, startCoords.current.y + dyPercent))
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(sticker.id, { rotation: (sticker.rotation + 45) % 360 });
  };

  const handleScale = (e: React.MouseEvent, dir: 1 | -1) => {
    e.stopPropagation();
    const newScale = Math.max(0.5, Math.min(3, sticker.scale + dir * 0.25));
    onUpdate(sticker.id, { scale: newScale });
  };

  return (
    <div
      className={`absolute origin-center touch-none select-none group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${sticker.x * 100}%`,
        top: `${sticker.y * 100}%`,
        width: '25%',
        aspectRatio: '1 / 1',
        transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
        zIndex: isSelected ? 50 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full">
        <img 
          src={sticker.url} 
          alt="sticker" 
          draggable={false}
          className={`w-full h-full object-contain drop-shadow-md pointer-events-none transition-all ${isSelected ? 'ring-2 ring-blood-red/50' : ''}`}
        />
        
        {isSelected && (
          <div className="sticker-controls absolute -inset-4 border-2 border-dashed border-blood-red/50 rounded-lg pointer-events-none" />
        )}
        
        {isSelected && (
          <>
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(sticker.id); }}
              className="sticker-controls absolute -top-4 -right-4 bg-white text-blood-red border-2 border-blood-red rounded-full p-1 hover:bg-blood-red hover:text-white transition-colors cursor-pointer pointer-events-auto"
              aria-label="Delete sticker"
            >
              <X size={12} strokeWidth={3} />
            </button>

            {/* Rotate button */}
            <button
              onClick={handleRotate}
              className="sticker-controls absolute -bottom-4 -left-4 bg-white text-ink-black border-2 border-ink-black rounded-full p-1 hover:bg-ink-black hover:text-white transition-colors cursor-pointer pointer-events-auto"
              aria-label="Rotate sticker"
            >
              <RotateCw size={12} strokeWidth={3} />
            </button>

            {/* Scale controls */}
            <div className="sticker-controls absolute -bottom-4 -right-4 flex flex-col items-center bg-white border-2 border-ink-black rounded-full overflow-hidden shadow-sm pointer-events-auto">
              <button
                onClick={(e) => handleScale(e, 1)}
                className="px-1.5 py-0.5 text-xs font-bold hover:bg-ink-black hover:text-white transition-colors"
                title="Perbesar"
              >
                +
              </button>
              <div className="w-full h-px bg-ink-black/20" />
              <button
                onClick={(e) => handleScale(e, -1)}
                className="px-1.5 py-0.5 text-xs font-bold hover:bg-ink-black hover:text-white transition-colors"
                title="Perkecil"
              >
                -
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
