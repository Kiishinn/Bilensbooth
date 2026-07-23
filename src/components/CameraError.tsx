import { Camera, AlertTriangle } from 'lucide-react';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export function CameraError({ error, onRetry }: CameraErrorProps) {
  const isDenied = error.includes('DENIED');

  return (
    <div className="border-4 border-blood-red bg-paper-base p-8 sm:p-12 text-center hard-shadow max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 border-4 border-blood-red flex items-center justify-center">
          {isDenied ? (
            <AlertTriangle size={40} className="text-blood-red" />
          ) : (
            <Camera size={40} className="text-blood-red" />
          )}
        </div>
      </div>

      <h3 className="font-display text-2xl font-bold uppercase mb-4">
        {isDenied ? 'ACCESS DENIED' : 'CONNECTION FAILED'}
      </h3>

      <p className="font-mono text-xs text-blood-red mb-8 max-w-md mx-auto leading-relaxed">
        {error}
      </p>

      <button
        onClick={onRetry}
        className="bg-ink-black text-paper-base font-mono text-sm px-8 py-4 uppercase border-4 border-ink-black btn-interact"
        aria-label="Retry camera access"
      >
        RETRY CONNECTION
      </button>
    </div>
  );
}
