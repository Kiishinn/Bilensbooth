import { useRef, useState, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  facingMode: 'user' | 'environment';
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  devices: MediaDeviceInfo[];
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (e) {
      console.error('Failed to enumerate devices', e);
    }
  }, []);

  const startCameraWithSettings = useCallback(
    async (mode: 'user' | 'environment', deviceId?: string) => {
      // Stop existing stream (handles StrictMode double-invoke + flip)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 960 },
        };
        
        if (deviceId) {
          videoConstraints.deviceId = { exact: deviceId };
        } else {
          videoConstraints.facingMode = mode;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        streamRef.current = mediaStream;
        facingModeRef.current = mode;
        setStream(mediaStream);
        setFacingMode(mode);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          try {
            await videoRef.current.play();
          } catch (e: any) {
            // Ignore AbortError caused by React 18 StrictMode unmounting
            if (e.name !== 'AbortError') throw e;
          }
        }
        
        // Fetch devices after successful permission
        fetchDevices();
      } catch (err: unknown) {
        const mediaError = err as DOMException;
        if (mediaError.name === 'NotAllowedError') {
          setError('AKSES KAMERA DITOLAK. PASTIKAN BROWSER DIIZINKAN MENGAKSES KAMERA.');
        } else if (mediaError.name === 'NotFoundError') {
          setError('TIDAK ADA KAMERA TERDETEKSI. HUBUNGKAN KAMERA DAN COBA LAGI.');
        } else if (mediaError.name === 'NotReadableError') {
          setError('KAMERA SEDANG DIGUNAKAN OLEH APLIKASI LAIN. TUTUP APLIKASI TERSEBUT DAN COBA LAGI.');
        } else if (mediaError.name === 'OverconstrainedError') {
          // Fallbacks
          if (deviceId) {
            setError(null);
            await startCameraWithSettings('user');
            return;
          }
          if (mode === 'environment') {
            setError(null);
            await startCameraWithSettings('user');
            return;
          }
          setError('KAMERA TIDAK DIDUKUNG.');
        } else {
          setError(`ERROR KAMERA: ${mediaError.message.toUpperCase()}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDevices]
  );

  const startCamera = useCallback((deviceId?: string) => {
    return startCameraWithSettings('user', deviceId);
  }, [startCameraWithSettings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    error,
    isLoading,
    facingMode,
    startCamera,
    stopCamera,
    devices,
  };
}
