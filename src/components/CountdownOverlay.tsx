interface CountdownOverlayProps {
  count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  if (count <= 0) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-ink-black/60"
      aria-live="assertive"
      aria-label={`Countdown: ${count}`}
    >
      <span
        key={count}
        className="font-mono text-[10rem] sm:text-[14rem] font-bold text-kodak-yellow countdown-pulse leading-none"
        style={{ textShadow: '8px 8px 0px #1b1c1c' }}
      >
        {count}
      </span>
    </div>
  );
}
