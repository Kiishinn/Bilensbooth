import { useState, useEffect } from 'react';
import { ArrowRight, Archive, ChevronDown, ChevronUp, Trash2, Camera, Aperture } from 'lucide-react';
import type { SessionRecord } from '../types/index';
import { getSessions, clearSessions, cleanupExpiredSessions, deleteSession } from '../utils/sessions';
import { getHighResPhoto } from '../utils/db';
import Swal from 'sweetalert2';
import { SplitText } from '../components/reactbits/SplitText';
import { TiltedCard } from '../components/reactbits/TiltedCard';

interface InitializeStepProps {
  onContinue: () => void;
}

export function InitializeStep({ onContinue }: InitializeStepProps) {
  const [showArchive, setShowArchive] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [isLoadingHighRes, setIsLoadingHighRes] = useState(false);

  useEffect(() => {
    cleanupExpiredSessions().then(() => {
      setSessions(getSessions());
    });
  }, []);

  const handleClearArchive = () => {
    Swal.fire({
      title: 'Hapus Semua Arsip?',
      text: "Anda tidak akan bisa mengembalikan foto-foto ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#171717',
      confirmButtonText: 'Ya, hapus semua!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false
    }).then((result) => {
      if (result.isConfirmed) {
        clearSessions();
        setSessions([]);
        setShowArchive(false);
        Swal.fire('Terhapus!', 'Semua riwayat arsip Anda telah dibersihkan.', 'success');
      }
    });
  };

  const handleOpenSession = async (session: SessionRecord) => {
    setSelectedSessionId(session.id);
    setIsLoadingHighRes(true);
    setHighResUrl(null);
    try {
      const url = await getHighResPhoto(session.id);
      setHighResUrl(url || session.thumbnailDataUrl);
    } catch (e) {
      console.error(e);
      setHighResUrl(session.thumbnailDataUrl);
    } finally {
      setIsLoadingHighRes(false);
    }
  };

  const handleDownloadHighRes = () => {
    if (!highResUrl) return;
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `bilens-booth-${timestamp}.jpeg`;
    link.href = highResUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteIndividualSession = () => {
    if (!selectedSessionId) return;
    Swal.fire({
      title: 'Hapus Foto Ini?',
      text: "Foto ini akan dihapus secara permanen dari arsip Anda!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#171717',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      scrollbarPadding: false
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSession(selectedSessionId);
        setSessions(getSessions());
        setSelectedSessionId(null);
        Swal.fire('Terhapus!', 'Foto telah dihapus dari arsip.', 'success');
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-5xl mx-auto px-4 relative z-10">
      
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
          <SplitText text="Bilens" delay={0.03} />
          <br />
          <span className="text-blood-red group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blood-red group-hover:to-kodak-yellow transition-all duration-500">
            <SplitText text="Booth." delay={0.03} />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-ink-black/80 font-body text-base sm:text-xl leading-relaxed mb-12">
          Platform photobooth digital bergaya analog. Ambil momen tak terlupakan dengan nuansa retro langsung dari perangkat Anda.
        </p>

        {/* Main CTA */}
        <div className="relative z-10">
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
                    <TiltedCard
                      key={session.id}
                      onClick={() => handleOpenSession(session)}
                      className="group border-2 border-ink-black/20 overflow-hidden bg-[#f4f4f5] hover:border-ink-black aspect-[1/2] flex items-center justify-center p-3 text-left"
                    >
                      {/* Checkerboard background to show transparent frames well */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]" />
                      
                      <img
                        src={session.thumbnailDataUrl}
                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 relative z-10"
                        alt={`Session from ${new Date(session.timestamp).toLocaleDateString()}`}
                      />
                      
                      {/* Always show date clearly on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-ink-black/80 backdrop-blur-sm p-3 py-4 translate-y-full group-hover:translate-y-0 transition-transform z-20 flex justify-center">
                        <span className="font-mono text-[9px] font-bold text-white tracking-wider">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </TiltedCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Archive Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/90 backdrop-blur-md p-4">
          <div className="bg-paper-base max-w-2xl w-full p-6 sm:p-8 border-4 border-ink-black hard-shadow flex flex-col items-center">
            
            {isLoadingHighRes ? (
              <div className="w-full aspect-[2/3] max-h-[60vh] flex flex-col items-center justify-center gap-4 bg-silver-halide border-4 border-ink-black">
                <div className="w-8 h-8 border-4 border-ink-black border-t-transparent animate-spin"></div>
                <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink-black/50">MENGAMBIL FOTO RESOLUSI TINGGI...</p>
              </div>
            ) : (
              <div className="relative w-full aspect-[2/3] max-h-[60vh] bg-silver-halide border-4 border-ink-black p-4 flex justify-center">
                 <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]" />
                 <img src={highResUrl!} alt="Arsip Foto" className="h-full w-auto object-contain drop-shadow-xl relative z-10" />
              </div>
            )}

            <div className="w-full flex gap-4 mt-6">
              <button
                onClick={handleDeleteIndividualSession}
                className="flex-1 py-4 flex items-center justify-center gap-2 font-mono font-bold text-sm uppercase tracking-widest border-4 border-blood-red text-blood-red hover:bg-blood-red/10 transition-colors btn-interact"
                title="Hapus Foto Ini"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="flex-[1.5] py-4 font-mono font-bold text-sm uppercase tracking-widest border-4 border-ink-black text-ink-black hover:bg-ink-black/5 transition-colors btn-interact"
              >
                TUTUP
              </button>
              <button
                onClick={handleDownloadHighRes}
                disabled={isLoadingHighRes}
                className="flex-[2] py-4 font-mono font-bold text-sm uppercase tracking-widest border-4 border-ink-black bg-kodak-yellow text-ink-black btn-interact disabled:opacity-50"
              >
                UNDUH ULANG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
