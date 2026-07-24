import { useEffect, useCallback, useState } from 'react';
import { Camera, RefreshCw, Zap, ChevronDown } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useCapture } from '../hooks/useCapture';
import { useShutterSound } from '../hooks/useShutterSound';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { FlashOverlay } from '../components/FlashOverlay';

interface CaptureStepProps {
  timerDelay: number;
  totalShots: number;
  isMirrored: boolean;
  deviceId: string;
  onTimerDelayChange: (delay: number) => void;
  onTotalShotsChange: (shots: number) => void;
  onMirroredChange: (m: boolean) => void;
  onDeviceIdChange: (id: string) => void;
  onCaptureComplete: (photos: string[]) => void;
}

export function CaptureStep({
  timerDelay,
  totalShots,
  isMirrored,
  deviceId,
  onTimerDelayChange,
  onTotalShotsChange,
  onMirroredChange,
  onDeviceIdChange,
  onCaptureComplete,
}: CaptureStepProps) {
  const {
    videoRef, stream, error, isLoading,
    startCamera, stopCamera, devices
  } = useCamera();
  
  const {
    capturedPhotos, isCapturing, countdown, currentShot, showFlash, startCapture,
  } = useCapture();
  
  const { playShutter } = useShutterSound();

  const [hasStarted, setHasStarted] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false); // Default mati sesuai permintaan

  // Stop camera on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  // Restart camera if deviceId changes
  useEffect(() => {
    startCamera(deviceId);
  }, [deviceId, startCamera]);

  const handleEngageShutter = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;
    setHasStarted(true);

    const captured = await startCapture(
      videoRef.current, 
      totalShots, 
      isMirrored, 
      timerDelay, 
      playShutter
    );
    
    if (captured.length === totalShots) {
      stopCamera();
      onCaptureComplete(captured);
    }
  }, [videoRef, isCapturing, timerDelay, totalShots, isMirrored, startCapture, stopCamera, onCaptureComplete, playShutter]);

  const showControls = !isCapturing && !!stream && !hasStarted;

  return (
    <div className={`max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 text-white transition-all duration-300`}>
      <FlashOverlay show={showFlash && flashEnabled} />

      {/* Main Camera Viewfinder */}
      <div className="relative aspect-[4/3] w-full bg-black overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="font-mono text-sm tracking-widest text-white/50">MEMBUKA KAMERA...</span>
          </div>
        )}

        {error && (
          <div className="text-center p-6 text-red-400">
            <p className="font-mono">{error}</p>
            <button onClick={() => startCamera(deviceId)} className="mt-4 px-4 py-2 bg-white/10 rounded-md hover:bg-white/20">Coba Lagi</button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : 'block'} transition-transform duration-300`}
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
        />

        {/* Start Overlay Overlay */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors cursor-pointer group" onClick={handleEngageShutter}>
            <div className="bg-neutral-800/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 group-hover:scale-105 transition-transform">
              <Camera size={20} className="text-white" />
              <span className="font-mono text-sm tracking-widest font-bold">KETUK UNTUK MEMULAI</span>
            </div>
          </div>
        )}

        <CountdownOverlay count={countdown} />

        {/* Status Indicators */}
        {isCapturing && (
          <div className="absolute top-6 right-6 bg-red-600 px-4 py-1.5 rounded-full font-mono text-xs font-bold tracking-widest animate-pulse">
            REC • {currentShot}/{totalShots}
          </div>
        )}
      </div>

      {/* Captured Thumbnails (During capture) */}
      {capturedPhotos.length > 0 && isCapturing && (
        <div className="flex gap-2 p-4 bg-neutral-950 justify-center overflow-x-auto">
          {capturedPhotos.map((photo, i) => (
            <img key={i} src={photo} className="h-16 rounded-md object-cover border border-white/20" alt={`Frame ${i + 1}`} />
          ))}
          {Array.from({ length: totalShots - capturedPhotos.length }).map((_, i) => (
            <div key={`e-${i}`} className="h-16 w-24 rounded-md bg-white/5 border border-white/10" />
          ))}
        </div>
      )}

      {/* Control Panel (Hidden during capture) */}
      <div className={`bg-neutral-800 p-6 grid gap-6 sm:grid-cols-2 transition-opacity duration-300 ${isCapturing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Device Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Sumber Kamera</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-md px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-white/30"
              value={deviceId}
              onChange={(e) => onDeviceIdChange(e.target.value)}
            >
              {devices.length === 0 && <option value="">Auto (Default Camera)</option>}
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Toggles (Mirror & Flash) */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Balik (Mirror)</label>
            <button 
              onClick={() => onMirroredChange(!isMirrored)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${isMirrored ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-900 border-white/5 text-white/50'}`}
            >
              <RefreshCw size={16} /> {isMirrored ? 'Nyala' : 'Mati'}
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Lampu Kilat</label>
            <button 
              onClick={() => setFlashEnabled(!flashEnabled)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${flashEnabled ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-900 border-white/5 text-white/50'}`}
            >
              <Zap size={16} /> {flashEnabled ? 'Nyala' : 'Mati'}
            </button>
          </div>
        </div>

        {/* Timer Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Timer Jeda</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-md px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-white/30"
              value={timerDelay}
              onChange={(e) => onTimerDelayChange(Number(e.target.value))}
            >
              {[3,4,5,6,7,8,9,10].map(d => (
                <option key={d} value={d}>{d} Detik</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Total Shots Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-white/50 tracking-widest uppercase">Total Jepretan</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-md px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-white/30"
              value={totalShots}
              onChange={(e) => onTotalShotsChange(Number(e.target.value))}
            >
              {[2,3,4,5,6,7,8,9,10,12,15].map(d => (
                <option key={d} value={d}>{d} Foto</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}
