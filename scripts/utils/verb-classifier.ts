
import { LANGUAGE_CONFIGS } from '../config/migration-config';

interface VerbData {
  word: string;
  conjugations: Array<{
    root_part: string | null;
    tense: { tense_name: string; mood: string | null };
  }>;
}

export function classifyVerb(
  verb: VerbData,
  languageCode: string
): string[] {
  const tags: string[] = [languageCode];

  switch (languageCode) {
    case 'es':
      tags.push(...classifySpanishVerb(verb));
      break;
    case 'fr':
      tags.push(...classifyFrenchVerb(verb));
      break;
    case 'en':
      tags.push(...classifyEnglishVerb(verb));
      break;
  }

  tags.push(...classifyByConjugations(verb));

  return Array.from(new Set(tags));
}

function classifySpanishVerb(verb: VerbData): string[] {
  const tags = ['spanish'];
  const word = verb.word;

  if (word.endsWith('ar')) tags.push('ar_verb', 'first_conjugation');
  else if (word.endsWith('er')) tags.push('er_verb', 'second_conjugation');
  else if (word.endsWith('ir')) tags.push('ir_verb', 'third_conjugation');

  if (word.endsWith('se')) tags.push('reflexive');

  if ((LANGUAGE_CONFIGS.es.commonIrregulars as readonly string[]).includes(word)) {
    tags.push('irregular', 'common_irregular');
  }

  return tags;
}

function classifyFrenchVerb(verb: VerbData): string[] {
  const tags = ['french'];
  const word = verb.word;

  if (word.endsWith('er')) tags.push('er_verb', 'first_group');
  else if (word.endsWith('ir')) tags.push('ir_verb', 'second_group');
  else if (word.endsWith('re')) tags.push('re_verb', 'third_group');
  else if (word.endsWith('oir')) tags.push('oir_verb', 'third_group');

  if (word.startsWith('se ') || word.startsWith("s'")) tags.push('pronominal');

  if ((LANGUAGE_CONFIGS.fr.commonIrregulars as readonly string[]).includes(word)) {
    tags.push('irregular', 'common_irregular');
  }

  return tags;
}

function classifyEnglishVerb(verb: VerbData): string[] {
  const tags = ['english'];
  const word = verb.word;

  if ((LANGUAGE_CONFIGS.en.commonIrregulars as readonly string[]).includes(word)) {
    tags.push('irregular');
  } else {
    tags.push('regular');
  }

  const modals = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'];
  if (modals.includes(word)) tags.push('modal');

  return tags;
}

function classifyByConjugations(verb: VerbData): string[] {
  const tags: string[] = [];

  if (verb.conjugations.length === 0) {
    tags.push('no_conjugations');
    return tags;
  }

  const hasSubjunctive = verb.conjugations.some(c =>
    c.tense.mood?.toLowerCase().includes('subjunctive')
  );
  if (hasSubjunctive) tags.push('has_subjunctive');

  const hasImperative = verb.conjugations.some(c =>
    c.tense.mood?.toLowerCase().includes('imperative')
  );
  if (hasImperative) tags.push('has_imperative');

  const uniqueTenses = new Set(verb.conjugations.map(c => c.tense.tense_name)).size;
  if (uniqueTenses >= 10) tags.push('complete_conjugation');
  if (uniqueTenses < 5) tags.push('partial_conjugation');

  return tags;
}
