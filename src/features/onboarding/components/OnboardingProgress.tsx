'use client';

import { cn } from '@/lib/utils';
import { TOTAL_STEPS } from '../types';

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            step === currentStep
              ? 'w-8 bg-primary'
              : step < currentStep
                ? 'w-2 bg-primary/60'
                : 'w-2 bg-muted'
          )}
        />
      ))}
    </div>
  );
}
