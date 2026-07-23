import { useEffect, useCallback, useState } from 'react';
import { Aperture, RefreshCw } from 'lucide-react';
import type { TimerDelay } from '../types/index';
import { useCamera } from '../hooks/useCamera';
import { useCapture } from '../hooks/useCapture';
import { useShutterSound } from '../hooks/useShutterSound';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { FlashOverlay } from '../components/FlashOverlay';
import { CameraError } from '../components/CameraError';

interface CaptureStepProps {
  timerDelay: TimerDelay;
  onTimerDelayChange: (delay: TimerDelay) => void;
  onCaptureComplete: (photos: string[]) => void;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function CaptureStep({
  timerDelay,
  onTimerDelayChange,
  onCaptureComplete,
}: CaptureStepProps) {
  const {
    videoRef, stream, error, isLoading, facingMode,
    startCamera, stopCamera, flipCamera,
  } = useCamera();
  const {
    capturedPhotos, isCapturing, countdown, currentShot, showFlash, startCapture,
  } = useCapture();
  const { playShutter } = useShutterSound();

  const [hasStarted, setHasStarted] = useState(false);
  const [isPreDelay, setIsPreDelay] = useState(false);
  const [preDelayCount, setPreDelayCount] = useState(0);

  useEffect(() => {
    startCamera();
    return () => { stopCamera(); };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (showFlash) playShutter();
  }, [showFlash, playShutter]);

  const handleEngageShutter = useCallback(async () => {
    if (!videoRef.current || isCapturing || isPreDelay) return;
    setHasStarted(true);

    // Pre-capture delay (#16)
    if (timerDelay > 0) {
      setIsPreDelay(true);
      for (let i = timerDelay; i > 0; i--) {
        setPreDelayCount(i);
        await delay(1000);
      }
      setPreDelayCount(0);
      setIsPreDelay(false);
    }

    const captured = await startCapture(videoRef.current);
    if (captured.length === 6) {
      stopCamera();
      onCaptureComplete(captured);
    }
  }, [videoRef, isCapturing, isPreDelay, timerDelay, startCapture, stopCamera, onCaptureComplete]);

  if (error) {
    return <CameraError error={error} onRetry={startCamera} />;
  }

  const showControls = !isCapturing && !isPreDelay && !!stream && !hasStarted;

  return (
    <div className="max-w-3xl mx-auto">
      <FlashOverlay show={showFlash} />

      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Sesi Foto
        </h2>
        <p className="font-mono text-xs sm:text-sm mt-2 text-ink-black/50 uppercase tracking-wider">
          {isPreDelay
            ? 'MENYIAPKAN KAMERA...'
            : isCapturing
              ? `EXPOSURE ${currentShot}/6 — HOLD POSITION`
              : 'POSITION SUBJECT IN FRAME — THEN ENGAGE SHUTTER'}
        </p>
      </div>

      {/* Camera Preview */}
      <div className="relative border-4 border-ink-black hard-shadow mb-6 sm:mb-8 bg-ink-black overflow-hidden">
        {isLoading && (
          <div className="aspect-[4/3] flex flex-col items-center justify-center bg-ink-black gap-4">
            <div className="w-10 h-10 border-4 border-kodak-yellow border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-kodak-yellow/60 tracking-widest">MEMBUKA KAMERA...</span>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={[
            'w-full aspect-[4/3] object-cover bg-ink-black',
            isLoading ? 'hidden' : 'block',
          ].join(' ')}
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          aria-label="Camera preview"
        />

        {/* Countdown overlay */}
        <CountdownOverlay count={countdown} />

        {/* Pre-delay countdown (#16) */}
        {isPreDelay && preDelayCount > 0 && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink-black/40">
            <span
              key={`pre-${preDelayCount}`}
              className="font-mono text-[8rem] sm:text-[10rem] font-bold text-paper-base countdown-pulse leading-none"
              style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
            >
              {preDelayCount}
            </span>
            <span className="font-mono text-sm text-paper-base/50 tracking-widest mt-4">
              MENYIAPKAN...
            </span>
          </div>
        )}

        {/* Viewfinder corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-kodak-yellow/70 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-kodak-yellow/70 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-kodak-yellow/70 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-kodak-yellow/70 pointer-events-none" aria-hidden="true" />

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-6 h-[1px] bg-kodak-yellow/30" />
          <div className="absolute w-[1px] h-6 bg-kodak-yellow/30" />
        </div>

        {/* LIVE indicator */}
        {showControls && (
          <div className="absolute top-4 left-14 flex items-center gap-2 font-mono text-[10px] text-blood-red tracking-widest">
            <div className="w-2 h-2 bg-blood-red animate-pulse" />
            LIVE
          </div>
        )}

        {/* Frame counter */}
        {isCapturing && (
          <div className="absolute top-4 right-14 bg-ink-black/80 border border-kodak-yellow/30 px-3 py-1 font-mono text-[10px] text-kodak-yellow tracking-widest">
            FRAME {currentShot}/6
          </div>
        )}

        {/* Camera Flip Button (#3) */}
        {showControls && (
          <button
            onClick={flipCamera}
            className="absolute bottom-4 right-14 bg-ink-black/70 hover:bg-ink-black/90 text-paper-base p-2 transition-colors"
            aria-label="Flip camera"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {/* Captured thumbnails */}
      {capturedPhotos.length > 0 && isCapturing && (
        <div className="flex gap-2 mb-6 justify-center">
          {capturedPhotos.map((photo, i) => (
            <div key={i} className="w-14 h-10 border-2 border-ink-black overflow-hidden hard-shadow-sm develop-reveal">
              <img src={photo} className="w-full h-full object-cover" alt={`Frame ${i + 1}`} />
            </div>
          ))}
          {Array.from({ length: 6 - capturedPhotos.length }).map((_, i) => (
            <div key={`e-${i}`} className="w-14 h-10 border-2 border-ink-black/20 bg-silver-halide/50" />
          ))}
        </div>
      )}

      {/* Timer Delay Selector (#16) */}
      {showControls && (
        <div className="flex items-center gap-2 mb-5 justify-center">
          <span className="font-mono text-[10px] text-ink-black/40 tracking-widest">JEDA WAKTU:</span>
          {([0, 5, 10] as TimerDelay[]).map((d) => (
            <button
              key={d}
              onClick={() => onTimerDelayChange(d)}
              className={[
                'font-mono text-xs px-3 py-1.5 border-2 transition-all cursor-pointer',
                timerDelay === d
                  ? 'border-blood-red bg-blood-red/5 text-blood-red font-bold'
                  : 'border-ink-black/20 hover:border-ink-black/40',
              ].join(' ')}
              aria-label={d === 0 ? 'No timer delay' : `${d} second delay`}
              aria-pressed={timerDelay === d}
            >
              {d === 0 ? 'Tidak Ada' : `${d}D`}
            </button>
          ))}
        </div>
      )}

      {/* ENGAGE SHUTTER */}
      {showControls && (
        <div className="flex justify-center">
          <button
            onClick={handleEngageShutter}
            className="flex items-center gap-3 bg-blood-red text-paper-base font-mono text-base sm:text-lg px-10 sm:px-14 py-5 uppercase border-4 border-ink-black btn-interact tracking-wider font-bold"
            aria-label="Engage shutter to begin capturing 6 photos"
          >
            <Aperture size={24} strokeWidth={2.5} />
            ENGAGE SHUTTER
          </button>
        </div>
      )}

      {(isCapturing || isPreDelay) && (
        <div className="text-center font-mono text-[10px] text-ink-black/40 uppercase tracking-widest mt-4">
          ■ {isPreDelay ? 'MENYIAPKAN KAMERA...' : 'SEDANG MENGAMBIL FOTO — JANGAN TUTUP JENDELA'}
        </div>
      )}
    </div>
  );
}
