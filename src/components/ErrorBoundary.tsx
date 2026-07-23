import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[BILENS BOOTH] Terjadi Kesalahan Sistem:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-4 border-blood-red bg-paper-base p-8 sm:p-12 text-center hard-shadow max-w-2xl mx-auto my-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 border-4 border-blood-red flex items-center justify-center">
              <AlertTriangle size={40} className="text-blood-red" />
            </div>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase mb-4 tracking-tight">
            Terjadi Kesalahan Sistem
          </h3>

          <p className="font-mono text-xs text-blood-red mb-2 max-w-md mx-auto tracking-wider">
            APLIKASI MENGALAMI GANGGUAN. SILAKAN RESET.
          </p>

          {this.state.error?.message && (
            <p className="font-mono text-[10px] text-ink-black/30 mb-8 max-w-md mx-auto tracking-wider break-all">
              {this.state.error.message.toUpperCase()}
            </p>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 bg-ink-black text-paper-base font-mono text-sm px-8 py-4 uppercase border-4 border-ink-black btn-interact tracking-wider"
            aria-label="Reset sistem setelah error"
          >
            <RotateCcw size={16} />
            RESET APLIKASI
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
