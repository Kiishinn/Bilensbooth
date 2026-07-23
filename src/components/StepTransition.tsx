import type { ReactNode } from 'react';

interface StepTransitionProps {
  stepKey: string;
  children: ReactNode;
}

export function StepTransition({ stepKey, children }: StepTransitionProps) {
  return (
    <div key={stepKey} className="step-enter">
      {children}
    </div>
  );
}
