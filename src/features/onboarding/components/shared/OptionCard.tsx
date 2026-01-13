'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function OptionCard({
  selected,
  onClick,
  children,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
        'hover:border-primary/50 hover:bg-accent/50',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card',
        className
      )}
    >
      {children}
      {selected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}
