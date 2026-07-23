interface FlashOverlayProps {
  show: boolean;
}

export function FlashOverlay({ show }: FlashOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-white flash-animation pointer-events-none"
      aria-hidden="true"
    />
  );
}
