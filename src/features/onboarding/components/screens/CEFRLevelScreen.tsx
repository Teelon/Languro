'use client';

import { cn } from '@/lib/utils';
import { CEFRLevel, CEFR_LEVELS } from '../../types';

interface CEFRLevelScreenProps {
  selected: CEFRLevel | null;
  onSelect: (level: CEFRLevel) => void;
  t: {
    screen3: {
      title: string;
      subtitle: string;
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };
}

export function CEFRLevelScreen({ selected, onSelect, t }: CEFRLevelScreenProps) {
  const selectedIndex = selected ? CEFR_LEVELS.findIndex(l => l.level === selected) : -1;

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen3.title}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t.screen3.subtitle}
      </p>

      {/* Visual Progress Bar Labels */}
      <div className="mb-4 flex w-full max-w-2xl justify-between px-4 text-sm font-medium text-muted-foreground">
        <span>{t.screen3.beginner}</span>
        <span>{t.screen3.intermediate}</span>
        <span>{t.screen3.advanced}</span>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8 h-2 w-full max-w-2xl rounded-full bg-muted">
        {selectedIndex >= 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
            style={{ width: `${(selectedIndex / (CEFR_LEVELS.length - 1)) * 100}%` }}
          />
        )}
        {/* Level markers */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {CEFR_LEVELS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 w-4 rounded-full border-2 transition-all',
                i <= selectedIndex
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30 bg-background'
              )}
            />
          ))}
        </div>
      </div>

      {/* Level Cards */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {CEFR_LEVELS.map((level) => (
          <button
            key={level.level}
            type="button"
            onClick={() => onSelect(level.level)}
            className={cn(
              'group relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all duration-200',
              'hover:border-primary/50 hover:bg-accent/50',
              selected === level.level
                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                : 'border-border bg-card'
            )}
          >
            <span
              className={cn(
                'text-xl font-bold transition-colors',
                selected === level.level ? 'text-primary' : 'text-foreground'
              )}
            >
              {level.level}
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              {level.label}
            </span>

            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -bottom-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg group-hover:block">
              {level.description}
            </div>
          </button>
        ))}
      </div>

      {/* Selected level description */}
      {selected && (
        <div className="mt-6 rounded-lg bg-accent/50 px-4 py-3">
          <p className="text-center text-sm text-foreground">
            <span className="font-semibold">{selected}</span>
            {' - '}
            {CEFR_LEVELS.find(l => l.level === selected)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
