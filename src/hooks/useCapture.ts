import { useState, useCallback, useRef } from 'react';

interface UseCaptureReturn {
  capturedPhotos: string[];
  isCapturing: boolean;
  countdown: number;
  currentShot: number;
  showFlash: boolean;
  startCapture: (
    videoElement: HTMLVideoElement, 
    totalShots: number, 
    isMirrored: boolean, 
    timerDelay: number, 
    onShoot: () => void
  ) => Promise<string[]>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function captureFrame(video: HTMLVideoElement, isMirrored: boolean): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;
  
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export function useCapture(): UseCaptureReturn {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentShot, setCurrentShot] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const cancelledRef = useRef(false);

  const startCapture = useCallback(
    async (
      videoElement: HTMLVideoElement, 
      totalShots: number, 
      isMirrored: boolean, 
      timerDelay: number,
      onShoot: () => void
    ): Promise<string[]> => {
      cancelledRef.current = false;
      setIsCapturing(true);
      setCapturedPhotos([]);
      const captured: string[] = [];

      for (let shot = 0; shot < totalShots; shot++) {
        if (cancelledRef.current) break;

        setCurrentShot(shot + 1);

        // Countdown based on user setting
        const currentDelay = timerDelay > 0 ? timerDelay : 3; // fallback to 3 if 0
        for (let count = currentDelay; count >= 1; count--) {
          if (cancelledRef.current) break;
          setCountdown(count);
          await delay(1000);
        }

        if (cancelledRef.current) break;
        setCountdown(0);

        // Try to activate hardware flash (torch) if available
        let torchSupported = false;
        let track: MediaStreamTrack | undefined;
        try {
          const stream = videoElement.srcObject as MediaStream;
          track = stream?.getVideoTracks()[0];
          if (track) {
            const capabilities = track.getCapabilities ? track.getCapabilities() : {};
            // TypeScript might not know about torch in capabilities, so we cast to any
            if ((capabilities as any).torch) {
              torchSupported = true;
              await track.applyConstraints({ advanced: [{ torch: true }] } as any);
              // Wait a bit for the hardware flash to light up and camera to adjust exposure
              await delay(200);
            }
          }
        } catch (e) {
          console.warn('Hardware flash not supported or failed to activate', e);
        }

        // Trigger Sound regardless of flash
        onShoot();

        // Trigger UI screen flash
        setShowFlash(true);

        // Capture the frame from the live video
        const dataUrl = captureFrame(videoElement, isMirrored);
        captured.push(dataUrl);
        setCapturedPhotos([...captured]);

        await delay(300);
        
        // Turn off hardware flash
        if (torchSupported && track) {
          try {
            await track.applyConstraints({ advanced: [{ torch: false }] } as any);
          } catch (e) {
            console.warn('Failed to turn off hardware flash', e);
          }
        }

        setShowFlash(false);

        // Brief pause before next shot (except after last)
        if (shot < totalShots - 1) {
          await delay(500);
        }
      }

      setIsCapturing(false);
      setCurrentShot(0);
      setCountdown(0);
      return captured;
    },
    []
  );

  return {
    capturedPhotos,
    isCapturing,
    countdown,
    currentShot,
    showFlash,
    startCapture,
  };
}
