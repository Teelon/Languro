'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  canProceed: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  backLabel: string;
  nextLabel: string;
  finishLabel: string;
}

export function NavigationButtons({
  onBack,
  onNext,
  canProceed,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  backLabel,
  nextLabel,
  finishLabel,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      {!isFirstStep && onBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      ) : (
        <div />
      )}

      <Button
        onClick={onNext}
        disabled={!canProceed || isLoading}
        size="lg"
        className="gap-2 px-8"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isLastStep ? (
          <>
            <Sparkles className="h-4 w-4" />
            {finishLabel}
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
