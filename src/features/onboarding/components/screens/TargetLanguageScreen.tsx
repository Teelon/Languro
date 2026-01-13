'use client';

import { SupportedLanguage } from '../../types';
import { LanguageCard } from '../shared/LanguageCard';

interface TargetLanguageScreenProps {
  selected: SupportedLanguage | null;
  onSelect: (lang: SupportedLanguage) => void;
  availableLanguages: SupportedLanguage[];
  t: {
    screen2: { title: string; subtitle: string };
    languages: Record<SupportedLanguage, string>;
  };
}

export function TargetLanguageScreen({
  selected,
  onSelect,
  availableLanguages,
  t,
}: TargetLanguageScreenProps) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen2.title}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t.screen2.subtitle}
      </p>

      <div className="grid w-full max-w-sm grid-cols-1 gap-4 sm:grid-cols-2">
        {availableLanguages.map((lang) => (
          <LanguageCard
            key={lang}
            language={lang}
            label={t.languages[lang]}
            selected={selected === lang}
            onClick={() => onSelect(lang)}
          />
        ))}
      </div>
    </div>
  );
}
