import { useEffect, useState } from 'react';

interface FlashOverlayProps {
  show: boolean;
}

export function FlashOverlay({ show }: FlashOverlayProps) {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (show) {
      setIsFlashing(true);
      // Flash lasts for 800ms to allow a smooth fade out
      const timer = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isFlashing) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-white flash-animation pointer-events-none"
      aria-hidden="true"
    />
  );
}
