import { useReducer, useCallback } from 'react';
import {
  AppStep,
  INITIAL_STATE,
} from './types/index';
import type { AppState, AppAction, LayoutType, FilterType, FrameColor, TimerDelay } from './types/index';
import { StepIndicator } from './components/StepIndicator';
import { StepTransition } from './components/StepTransition';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InitializeStep } from './pages/InitializeStep';
import { CaptureStep } from './pages/CaptureStep';
import { ContactSheetStep } from './pages/ContactSheetStep';
import { DarkroomStep } from './pages/DarkroomStep';
import { ExportStep } from './pages/ExportStep';

/* ─── Reducer (#7) ─── */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SELECT_LAYOUT':
      return { ...state, layout: action.payload };
    case 'CAPTURE_COMPLETE':
      return {
        ...state,
        photos: action.payload,
        selectedIndices: [],
        step: AppStep.CONTACT_SHEET,
      };
    case 'SET_SELECTED_INDICES':
      return { ...state, selectedIndices: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_FRAME_COLOR':
      return { ...state, frameColor: action.payload };
    case 'SET_CUSTOM_TEXT':
      return { ...state, customText: action.payload };
    case 'SET_TIMER_DELAY':
      return { ...state, timerDelay: action.payload };
    case 'RETAKE':
      return { ...state, photos: [], selectedIndices: [], step: AppStep.CAPTURE };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  const selectedPhotos = state.selectedIndices.map((i) => state.photos[i]);

  // ─── Dispatch Helpers ───
  const handleLayoutSelect = useCallback((l: LayoutType) => {
    dispatch({ type: 'SELECT_LAYOUT', payload: l });
  }, []);

  const handleStartCapture = useCallback(() => {
    if (state.layout) dispatch({ type: 'SET_STEP', payload: AppStep.CAPTURE });
  }, [state.layout]);

  const handleCaptureComplete = useCallback((photos: string[]) => {
    dispatch({ type: 'CAPTURE_COMPLETE', payload: photos });
  }, []);

  const handleSelectionConfirm = useCallback(() => {
    if (state.selectedIndices.length === 4) {
      dispatch({ type: 'SET_STEP', payload: AppStep.DARKROOM });
    }
  }, [state.selectedIndices.length]);

  const handleDarkroomConfirm = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: AppStep.EXPORT });
  }, []);

  const handleRetake = useCallback(() => {
    dispatch({ type: 'RETAKE' });
  }, []);

  const handleBackToContactSheet = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: AppStep.CONTACT_SHEET });
  }, []);

  const handleBackToDarkroom = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: AppStep.DARKROOM });
  }, []);

  const handleStartOver = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleFilterChange = useCallback((f: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: f });
  }, []);

  const handleFrameColorChange = useCallback((c: FrameColor) => {
    dispatch({ type: 'SET_FRAME_COLOR', payload: c });
  }, []);

  const handleCustomTextChange = useCallback((t: string) => {
    dispatch({ type: 'SET_CUSTOM_TEXT', payload: t });
  }, []);

  const handleTimerDelayChange = useCallback((d: TimerDelay) => {
    dispatch({ type: 'SET_TIMER_DELAY', payload: d });
  }, []);

  const handleSelectionChange = useCallback((indices: number[]) => {
    dispatch({ type: 'SET_SELECTED_INDICES', payload: indices });
  }, []);

  // ─── Step Router ───
  const renderStep = () => {
    switch (state.step) {
      case AppStep.INITIALIZE:
        return (
          <InitializeStep
            layout={state.layout}
            onLayoutSelect={handleLayoutSelect}
            onContinue={handleStartCapture}
          />
        );
      case AppStep.CAPTURE:
        return (
          <CaptureStep
            timerDelay={state.timerDelay}
            onTimerDelayChange={handleTimerDelayChange}
            onCaptureComplete={handleCaptureComplete}
          />
        );
      case AppStep.CONTACT_SHEET:
        return (
          <ContactSheetStep
            photos={state.photos}
            selectedIndices={state.selectedIndices}
            onSelectionChange={handleSelectionChange}
            onConfirm={handleSelectionConfirm}
            onRetake={handleRetake}
          />
        );
      case AppStep.DARKROOM:
        return (
          <DarkroomStep
            layout={state.layout!}
            photos={selectedPhotos}
            filter={state.filter}
            frameColor={state.frameColor}
            customText={state.customText}
            onFilterChange={handleFilterChange}
            onFrameColorChange={handleFrameColorChange}
            onCustomTextChange={handleCustomTextChange}
            onConfirm={handleDarkroomConfirm}
            onBack={handleBackToContactSheet}
          />
        );
      case AppStep.EXPORT:
        return (
          <ExportStep
            layout={state.layout!}
            photos={selectedPhotos}
            filter={state.filter}
            frameColor={state.frameColor}
            customText={state.customText}
            onStartOver={handleStartOver}
            onBack={handleBackToDarkroom}
          />
        );
    }
  };

  return (
    <div className="noise-bg min-h-screen flex flex-col relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b-4 border-ink-black bg-ink-black text-paper-base">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">
                Bilens Booth
              </h1>
              <p className="font-mono text-[10px] sm:text-xs text-silver-halide/60 tracking-[0.25em] mt-1">
                MAKE THE MOMENT FOR FREE
              </p>
            </div>
            <div className="font-mono text-[10px] text-silver-halide/40 text-right hidden sm:block tracking-widest leading-relaxed">
              <div>100% SISI-KLIEN</div>
              <div>TANPA UNGGAHAN</div>
              <div>MENGUTAMAKAN PRIVASI</div>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={state.step} />

        {/* Main Content — Error Boundary (#13) + Step Transition (#1) */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
          <ErrorBoundary onReset={handleStartOver}>
            <StepTransition stepKey={state.step}>
              {renderStep()}
            </StepTransition>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-ink-black mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 font-mono text-[10px] text-ink-black/30 flex flex-col sm:flex-row justify-between gap-1 tracking-widest">
            <span>BILENS BOOTH V1.1</span>
            <span>FOTO ANDA TIDAK PERNAH KELUAR DARI PERANGKAT INI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
