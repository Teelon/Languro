
import { LANGUAGE_CONFIGS } from '../config/migration-config';

interface VerbData {
  word: string;
  conjugations: Array<{
    root_part: string | null;
    tense: { tense_name: string; mood: string | null };
  }>;
}

export function estimateDifficulty(
  verb: VerbData,
  languageCode: string
): number {
  if (verb.conjugations.length === 0) return 1;

  const baseDifficulty = getBaseDifficulty(verb.word, languageCode);
  const irregularityScore = calculateIrregularity(verb.conjugations);
  const tenseComplexity = analyzeTenseComplexity(verb.conjugations);

  const difficulty = Math.round(
    baseDifficulty * 0.4 +
    irregularityScore * 0.4 +
    tenseComplexity * 0.2
  );

  return Math.max(1, Math.min(5, difficulty));
}

function getBaseDifficulty(word: string, languageCode: 'es' | 'en' | 'fr' | string): number {
  const config = (LANGUAGE_CONFIGS as any)[languageCode];

  if (config.commonIrregulars.includes(word)) {
    return 5;
  }

  for (const [ending, _] of Object.entries(config.regularPatterns as Record<string, any>)) {
    if (word.endsWith(ending)) {
      return languageCode === 'es' && ending === 'ir' ? 3 : 2;
    }
  }

  return languageCode === 'en' ? 1 : 3;
}

function calculateIrregularity(conjugations: VerbData['conjugations']): number {
  const roots = conjugations
    .map(c => c.root_part)
    .filter((r): r is string => r !== null);

  if (roots.length === 0) return 1;

  const uniqueRoots = new Set(roots);
  const irregularityRatio = uniqueRoots.size / roots.length;

  if (irregularityRatio > 0.5) return 5;
  if (irregularityRatio > 0.3) return 4;
  if (irregularityRatio > 0.15) return 3;
  return 2;
}

function analyzeTenseComplexity(conjugations: VerbData['conjugations']): number {
  const tenses = new Set(conjugations.map(c => c.tense.tense_name));

  const complexTenses = ['Present Subjunctive', 'Imperfect Subjunctive', 'Future Subjunctive',
    'Subjonctif Présent', 'Subjonctif Imparfait', 'Passé Simple',
    'Past Perfect', 'Future Perfect Continuous'];

  const hasComplexTenses = Array.from(tenses).some(tense =>
    complexTenses.includes(tense)
  );

  if (hasComplexTenses) return 5;
  if (tenses.size > 10) return 4;
  if (tenses.size > 6) return 3;
  return 2;
}
