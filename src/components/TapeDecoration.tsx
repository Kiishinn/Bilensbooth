interface TapeDecorationProps {
  className?: string;
  rotation?: number;
  width?: number;
}

export function TapeDecoration({
  className = '',
  rotation = -3,
  width = 100,
}: TapeDecorationProps) {
  return (
    <div
      className={`tape ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        width: `${width}px`,
      }}
      aria-hidden="true"
    />
  );
}
