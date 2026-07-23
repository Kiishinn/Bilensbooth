import { AppStep, STEP_LABELS } from '../types/index';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS: AppStep[] = [
  AppStep.INITIALIZE,
  AppStep.CAPTURE,
  AppStep.CONTACT_SHEET,
  AppStep.DARKROOM,
  AppStep.EXPORT,
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <nav
      className="border-b-4 border-ink-black bg-silver-halide overflow-x-auto"
      aria-label="Progress steps"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ol className="flex" role="list">
          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;

            return (
              <li
                key={step}
                className={[
                  'flex items-center gap-2 px-3 sm:px-4 py-3 font-mono text-[10px] sm:text-xs whitespace-nowrap',
                  'border-r-2 border-ink-black/30 last:border-r-0',
                  'transition-colors duration-200',
                  isActive ? 'bg-kodak-yellow text-ink-black font-bold' : '',
                  isComplete ? 'bg-ink-black text-paper-base' : '',
                  !isActive && !isComplete ? 'text-ink-black/30' : '',
                ].join(' ')}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={[
                    'w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 flex-shrink-0',
                    isActive ? 'border-ink-black bg-ink-black text-kodak-yellow' : '',
                    isComplete ? 'border-paper-base/50 bg-paper-base text-ink-black' : '',
                    !isActive && !isComplete ? 'border-ink-black/20' : '',
                  ].join(' ')}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span className="hidden md:inline tracking-wider">
                  {STEP_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
