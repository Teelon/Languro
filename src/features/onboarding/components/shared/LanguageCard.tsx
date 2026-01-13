'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { SupportedLanguage, LANGUAGE_FLAGS } from '../../types';

interface LanguageCardProps {
  language: SupportedLanguage;
  label: string;
  selected: boolean;
  onClick: () => void;
  showAllLabels?: boolean;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, Record<SupportedLanguage, string>> = {
  en: { en: 'English', fr: 'French', es: 'Spanish' },
  fr: { en: 'Anglais', fr: 'Français', es: 'Espagnol' },
  es: { en: 'Inglés', fr: 'Francés', es: 'Español' },
};

export function LanguageCard({
  language,
  label,
  selected,
  onClick,
  showAllLabels = false,
}: LanguageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200',
        'hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]'
          : 'border-border bg-card'
      )}
    >
      <div className="relative h-16 w-24 overflow-hidden rounded-md shadow-sm">
        <img
          src={`https://flagcdn.com/w160/${LANGUAGE_FLAGS[language].toLowerCase()}.png`}
          alt={label}
          className="h-full w-full object-cover"
        />
      </div>

      {showAllLabels ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-foreground">
            {LANGUAGE_LABELS[language][language]}
          </span>
          <span className="text-sm text-muted-foreground">
            {Object.entries(LANGUAGE_LABELS)
              .filter(([key]) => key !== language)
              .map(([, labels]) => labels[language])
              .join(' • ')}
          </span>
        </div>
      ) : (
        <span className="text-lg font-semibold text-foreground">{label}</span>
      )}

      {selected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}
