import { useState, useEffect } from 'react';
import { ArrowRight, Archive, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { LayoutType, SessionRecord } from '../types/index';
import { TapeDecoration } from '../components/TapeDecoration';
import { getSessions, clearSessions } from '../utils/sessions';

interface InitializeStepProps {
  layout: LayoutType | null;
  onLayoutSelect: (layout: LayoutType) => void;
  onContinue: () => void;
}

export function InitializeStep({
  layout,
  onLayoutSelect,
  onContinue,
}: InitializeStepProps) {
  const [showArchive, setShowArchive] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleClearArchive = () => {
    clearSessions();
    setSessions([]);
    setShowArchive(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Title */}
      <div className="mb-10 sm:mb-14 relative">
        <TapeDecoration className="-top-3 left-8" rotation={-2} width={90} />
        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">
          Persiapan
        </h2>
        <p className="font-mono text-xs sm:text-sm mt-3 text-ink-black/50 uppercase tracking-wider">
          PILIH FORMAT CETAK UNTUK MEMULAI PENGAMBILAN GAMBAR
        </p>
      </div>

      {/* Layout Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
        {/* STANDARD STRIP */}
        <button
          onClick={() => onLayoutSelect('strip')}
          className={[
            'relative p-6 sm:p-8 border-4 text-left transition-all duration-200 group',
            layout === 'strip'
              ? 'border-blood-red bg-blood-red/5 hard-shadow'
              : 'border-ink-black bg-paper-base hard-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard',
          ].join(' ')}
          aria-label="Select Standard Strip 1 by 4 layout"
          aria-pressed={layout === 'strip'}
        >
          {layout === 'strip' && (
            <div className="absolute top-0 right-0 bg-blood-red text-paper-base font-mono text-[10px] px-3 py-1 tracking-wider">
              ● DIPILIH
            </div>
          )}
          <div className="mb-5">
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight">
              Strip Standar
            </h3>
            <p className="font-mono text-[10px] text-ink-black/40 mt-1 tracking-widest">
              FORMAT: 1×4 VERTIKAL
            </p>
          </div>
          <div className="flex justify-center py-4">
            <div className="w-14 flex flex-col gap-[3px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={[
                  'w-full h-9 border-2 transition-colors duration-200',
                  layout === 'strip'
                    ? 'border-blood-red bg-blood-red/10'
                    : 'border-ink-black/40 bg-silver-halide group-hover:border-ink-black',
                ].join(' ')} />
              ))}
            </div>
          </div>
          <p className="font-body text-sm text-ink-black/50 mt-3">
            Strip foto vertikal klasik. Empat bingkai disusun berurutan.
          </p>
        </button>

        {/* EVIDENCE GRID */}
        <button
          onClick={() => onLayoutSelect('grid')}
          className={[
            'relative p-6 sm:p-8 border-4 text-left transition-all duration-200 group',
            layout === 'grid'
              ? 'border-blood-red bg-blood-red/5 hard-shadow'
              : 'border-ink-black bg-paper-base hard-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard',
          ].join(' ')}
          aria-label="Select Evidence Grid 2 by 2 layout"
          aria-pressed={layout === 'grid'}
        >
          {layout === 'grid' && (
            <div className="absolute top-0 right-0 bg-blood-red text-paper-base font-mono text-[10px] px-3 py-1 tracking-wider">
              ● DIPILIH
            </div>
          )}
          <div className="mb-5">
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight">
              Grid Persegi
            </h3>
            <p className="font-mono text-[10px] text-ink-black/40 mt-1 tracking-widest">
              FORMAT: 2×2 PERSEGI
            </p>
          </div>
          <div className="flex justify-center py-4">
            <div className="grid grid-cols-2 gap-[3px] w-[72px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={[
                  'w-full h-9 border-2 transition-colors duration-200',
                  layout === 'grid'
                    ? 'border-blood-red bg-blood-red/10'
                    : 'border-ink-black/40 bg-silver-halide group-hover:border-ink-black',
                ].join(' ')} />
              ))}
            </div>
          </div>
          <p className="font-body text-sm text-ink-black/50 mt-3">
            Kolase berbentuk persegi. Format lembar kontak dua-kali-dua.
          </p>
        </button>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={!layout}
          className="flex items-center gap-3 bg-ink-black text-paper-base font-mono text-sm px-8 py-4 uppercase border-4 border-ink-black btn-interact tracking-wider"
          aria-label="Continue to capture step"
        >
          MULAI SESI FOTO
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ─── Session Archive (#15) ─── */}
      {sessions.length > 0 && (
        <div className="mt-12 border-t-4 border-ink-black/10 pt-6">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="font-mono text-xs text-ink-black/40 uppercase tracking-widest hover:text-ink-black transition-colors flex items-center gap-2"
            aria-expanded={showArchive}
            aria-label="Toggle session archive"
          >
            <Archive size={14} />
            ARSIP ({sessions.length} {sessions.length === 1 ? 'SESI' : 'SESI'})
            {showArchive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showArchive && (
            <div className="mt-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-2 border-ink-black/20 overflow-hidden bg-silver-halide"
                  >
                    <img
                      src={session.thumbnailDataUrl}
                      className="w-full h-auto"
                      alt={`Session from ${new Date(session.timestamp).toLocaleDateString()}`}
                    />
                    <div className="p-1.5 font-mono text-[8px] text-ink-black/40 tracking-wider leading-relaxed">
                      <div>{new Date(session.timestamp).toLocaleDateString()}</div>
                      <div>{session.customText || 'BILENS BOOTH'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleClearArchive}
                className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-blood-red uppercase tracking-widest hover:underline"
                aria-label="Clear all archived sessions"
              >
                <Trash2 size={10} />
                HAPUS ARSIP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
