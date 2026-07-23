import { useState, useCallback, useRef } from 'react';

interface UseCaptureReturn {
  capturedPhotos: string[];
  isCapturing: boolean;
  countdown: number;
  currentShot: number;
  showFlash: boolean;
  startCapture: (videoElement: HTMLVideoElement, totalShots: number, isMirrored: boolean) => Promise<string[]>;
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
    async (videoElement: HTMLVideoElement, totalShots: number, isMirrored: boolean): Promise<string[]> => {
      cancelledRef.current = false;
      setIsCapturing(true);
      setCapturedPhotos([]);
      const captured: string[] = [];

      for (let shot = 0; shot < totalShots; shot++) {
        if (cancelledRef.current) break;

        setCurrentShot(shot + 1);

        // Countdown: 3, 2, 1
        for (let count = 3; count >= 1; count--) {
          if (cancelledRef.current) break;
          setCountdown(count);
          await delay(1000);
        }

        if (cancelledRef.current) break;
        setCountdown(0);

        // Trigger flash
        setShowFlash(true);

        // Capture the frame from the live video
        const dataUrl = captureFrame(videoElement, isMirrored);
        captured.push(dataUrl);
        setCapturedPhotos([...captured]);

        await delay(300);
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
