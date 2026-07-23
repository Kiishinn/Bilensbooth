import { useState, useEffect } from 'react';
import { ArrowRight, Archive, ChevronDown, ChevronUp, Trash2, Camera, Aperture } from 'lucide-react';
import type { SessionRecord } from '../types/index';
import { getSessions, clearSessions } from '../utils/sessions';

interface InitializeStepProps {
  onContinue: () => void;
}

export function InitializeStep({ onContinue }: InitializeStepProps) {
  const [showArchive, setShowArchive] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleClearArchive = () => {
    if(confirm('Apakah Anda yakin ingin menghapus semua riwayat sesi?')) {
      clearSessions();
      setSessions([]);
      setShowArchive(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-5xl mx-auto px-4 relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-10 opacity-10 rotate-12 pointer-events-none">
        <Aperture size={200} strokeWidth={1} />
      </div>
      <div className="absolute bottom-20 left-10 opacity-10 -rotate-12 pointer-events-none">
        <Camera size={150} strokeWidth={1} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 py-12">
        {/* Interactive Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[20%] left-[10%] animate-[bounce_4s_infinite] opacity-20">
            <div className="w-16 h-20 border-4 border-ink-black -rotate-12 bg-silver-halide"></div>
          </div>
          <div className="absolute top-[60%] right-[15%] animate-[bounce_5s_infinite_100ms] opacity-20">
            <div className="w-20 h-24 border-4 border-ink-black rotate-6 bg-silver-halide"></div>
          </div>
          <div className="absolute top-[30%] right-[20%] animate-[bounce_6s_infinite_300ms] opacity-20">
            <div className="w-12 h-12 border-4 border-ink-black rotate-45 bg-silver-halide"></div>
          </div>
        </div>

        {/* Huge Interactive Title */}
        <h1 className="relative font-display text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-ink-black drop-shadow-sm mb-6 z-10 group cursor-default">
          Bilens
          <br />
          <span className="text-blood-red group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blood-red group-hover:to-kodak-yellow transition-all duration-500">
            Booth.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-ink-black/60 font-body text-base sm:text-xl leading-relaxed mb-12">
          Platform photobooth digital bergaya analog. Ambil momen tak terlupakan dengan nuansa retro langsung dari perangkat Anda.
        </p>

        {/* Main CTA */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-blood-red/20 blur-2xl rounded-full animate-pulse"></div>
          <button
            onClick={onContinue}
            className="group relative flex items-center gap-4 bg-ink-black text-paper-base font-mono text-lg sm:text-xl px-12 py-6 uppercase border-4 border-ink-black tracking-widest hover:bg-blood-red hover:border-blood-red transition-all duration-300 hard-shadow hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-hard overflow-hidden"
            aria-label="Continue to capture step"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Camera size={26} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
            <span className="relative z-10 font-bold">Mulai Sesi Foto</span>
            <ArrowRight size={26} className="group-hover:translate-x-3 transition-transform duration-300 relative z-10" />
          </button>
        </div>
      </div>

      {/* ─── Session Archive ─── */}
      {sessions.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mt-auto pb-12">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="bg-paper-base border-2 border-ink-black/20 hover:border-ink-black px-6 py-2.5 rounded-full font-mono text-xs text-ink-black uppercase tracking-widest transition-all flex items-center gap-3 hard-shadow-sm"
              aria-expanded={showArchive}
            >
              <Archive size={14} />
              Arsip ({sessions.length} Sesi)
              {showArchive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showArchive && (
              <div className="w-full mt-8 p-6 bg-silver-halide/30 border-4 border-ink-black/10 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-xs tracking-widest font-bold">RIWAYAT FOTO ANDA</h3>
                  <button
                    onClick={handleClearArchive}
                    className="flex items-center gap-2 font-mono text-[10px] text-blood-red uppercase tracking-widest hover:bg-blood-red/10 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Trash2 size={12} /> Hapus Arsip
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="group relative border-2 border-ink-black/20 overflow-hidden bg-silver-halide hover:border-ink-black transition-colors"
                    >
                      <img
                        src={session.thumbnailDataUrl}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={`Session from ${new Date(session.timestamp).toLocaleDateString()}`}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-black/90 to-transparent p-3 pt-8 translate-y-full group-hover:translate-y-0 transition-transform">
                        <div className="font-mono text-[9px] text-paper-base tracking-wider">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
