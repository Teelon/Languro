'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Music,
  Film,
  Trophy,
  Plane,
  Utensils,
  Landmark,
  TrendingUp,
  Laptop,
  BookOpen,
  Palette,
  Gamepad2,
  Trees,
} from 'lucide-react';
import { Interest, INTERESTS } from '../../types';

interface InterestsScreenProps {
  selected: Interest[];
  onToggle: (interest: Interest) => void;
  t: {
    screen6: {
      title: string;
      subtitle: string;
      interests: Record<Interest, string>;
      minRequired: string;
    };
  };
}

const ICONS: Record<string, React.ReactNode> = {
  Music: <Music className="h-5 w-5" />,
  Film: <Film className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Plane: <Plane className="h-5 w-5" />,
  Utensils: <Utensils className="h-5 w-5" />,
  Landmark: <Landmark className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Laptop: <Laptop className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  Gamepad2: <Gamepad2 className="h-5 w-5" />,
  Trees: <Trees className="h-5 w-5" />,
};

export function InterestsScreen({
  selected,
  onToggle,
  t,
}: InterestsScreenProps) {
  const isSelected = (interest: Interest) => selected.includes(interest);

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen6.title}
      </h1>
      <p className="mb-2 text-center text-muted-foreground">
        {t.screen6.subtitle}
      </p>

      <div className="mb-6 flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium',
            selected.length >= 3 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
          )}
        >
          {selected.length}/3
        </span>
        {selected.length < 3 && (
          <span className="text-sm text-muted-foreground">
            ({t.screen6.minRequired})
          </span>
        )}
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {INTERESTS.map((interest) => (
          <button
            key={interest.value}
            type="button"
            onClick={() => onToggle(interest.value)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
              'hover:border-primary/50 hover:bg-accent/50',
              isSelected(interest.value)
                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                : 'border-border bg-card'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isSelected(interest.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {ICONS[interest.icon]}
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isSelected(interest.value) ? 'text-primary' : 'text-foreground'
              )}
            >
              {t.screen6.interests[interest.value]}
            </span>

            {isSelected(interest.value) && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
