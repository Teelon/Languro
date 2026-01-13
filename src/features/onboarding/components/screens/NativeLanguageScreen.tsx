'use client';

import { SupportedLanguage } from '../../types';
import { LanguageCard } from '../shared/LanguageCard';

interface NativeLanguageScreenProps {
  selected: SupportedLanguage | null;
  onSelect: (lang: SupportedLanguage) => void;
  t: {
    screen1: { title: string; subtitle: string };
    languages: Record<SupportedLanguage, string>;
  };
}

const LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es'];

export function NativeLanguageScreen({
  selected,
  onSelect,
  t,
}: NativeLanguageScreenProps) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen1.title}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t.screen1.subtitle}
      </p>

      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3">
        {LANGUAGES.map((lang) => (
          <LanguageCard
            key={lang}
            language={lang}
            label={t.languages[lang]}
            selected={selected === lang}
            onClick={() => onSelect(lang)}
            showAllLabels
          />
        ))}
      </div>
    </div>
  );
}
