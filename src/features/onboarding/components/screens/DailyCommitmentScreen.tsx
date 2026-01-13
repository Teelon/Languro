'use client';

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { DailyCommitment, DAILY_COMMITMENTS } from '../../types';

interface DailyCommitmentScreenProps {
  selected: DailyCommitment | null;
  onSelect: (minutes: DailyCommitment) => void;
  t: {
    screen5: {
      title: string;
      subtitle: string;
      minutes: string;
      hour: string;
    };
  };
}

export function DailyCommitmentScreen({
  selected,
  onSelect,
  t,
}: DailyCommitmentScreenProps) {
  const formatTime = (minutes: number) => {
    if (minutes === 60) return `1 ${t.screen5.hour}`;
    return `${minutes} ${t.screen5.minutes}`;
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen5.title}
      </h1>
      <p className="mb-2 text-center text-muted-foreground">
        {t.screen5.subtitle}
      </p>

      <div className="grid w-full max-w-md grid-cols-2 gap-4 sm:grid-cols-4">
        {DAILY_COMMITMENTS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onSelect(minutes)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200',
              'hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]',
              selected === minutes
                ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.02]'
                : 'border-border bg-card'
            )}
          >
            <Clock
              className={cn(
                'h-6 w-6 transition-colors',
                selected === minutes ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'text-lg font-bold transition-colors',
                selected === minutes ? 'text-primary' : 'text-foreground'
              )}
            >
              {formatTime(minutes)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
