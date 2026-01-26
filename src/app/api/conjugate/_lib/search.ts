import { prisma } from '@/utils/prismaDB';
import { Prisma } from '@prisma/client';
import {
  findVerbInAnyLanguage,
  findConjugatedVerb,
  getExistingConjugations,
  saveConjugations,
  findVerbFuzzyCandidates,
  findConjugatedVerbFuzzyCandidates,
  getSuggestions,
} from '@/features/conjugator/services/db';
import { getLanguageId, getLanguageById } from '@/features/conjugator/services/metadata';
import { detectLanguageAndInfinitive, generateConjugations } from '@/features/conjugator/services/llm';
import type { FullConjugationData } from '@/features/conjugator/types';

export type SupportedLang = 'en' | 'fr' | 'es';

export type SearchStatus = 'FOUND' | 'DID_YOU_MEAN' | 'NOT_FOUND' | 'NEEDS_GENERATION';

export type SearchResponse = {
  status: SearchStatus;
  input: {
    raw: string;
    normalized: string;
    preferredLanguage?: SupportedLang;
  };
  match?: {
    language: SupportedLang;
    infinitive: string;
    source: 'EXACT' | 'REVERSE_EXACT' | 'FUZZY_ACCEPTED' | 'AI_LEMMA';
    confidence?: number;
  };
  suggestions?: Array<{
    language: SupportedLang;
    infinitive: string;
    source: 'FUZZY_LEMMA' | 'FUZZY_CONJ' | 'NEARBY';
    similarity?: number;
    matchedForm?: string;
  }>;
  needsGeneration?: boolean;
  message?: string;
  data?: FullConjugationData; // helper to pass data back directly if found
};

function normalizeInput(raw: string) {
  const normalized = raw.toLowerCase().trim().replace(/\s+/g, ' ');
  return { raw, normalized };
}

function lenNoSpaces(s: string) {
  return s.replace(/\s+/g, '').length;
}

// Length-aware acceptance: conservative for short tokens
function minAcceptForLen(len: number) {
  if (len <= 4) return 1.0; // effectively "never accept"
  if (len <= 6) return 0.70;
  if (len <= 8) return 0.60;
  return 0.55;
}

function shouldAcceptFuzzy(simBest: number, simSecond: number | null, minAccept: number, margin: number) {
  if (simBest < minAccept) return false;
  if (simSecond == null) return true;
  return (simBest - simSecond) >= margin;
}

function dedupeSuggestions<T extends { language: string; infinitive: string }>(items: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const key = `${it.language}::${it.infinitive}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/**
 * CHECK FLOW: orchestrates exact, reverse exact, fuzzy gating, optional light AI, and needsGeneration.
 * @param forceAi If true, skips the "Did you mean?" suggestion block and proceeds to AI detection.
 */
export async function searchConjugationsCheck(
  raw: string,
  preferredLanguage?: SupportedLang,
  forceAi: boolean = false
): Promise<SearchResponse> {
  const { normalized } = normalizeInput(raw);
  const l = lenNoSpaces(normalized);

  const base: SearchResponse = {
    status: 'NOT_FOUND',
    input: { raw, normalized, preferredLanguage },
  };

  if (!normalized || l === 0) {
    return { ...base, status: 'NOT_FOUND', message: 'Enter a verb to conjugate.' };
  }

  // 1) Exact infinitive
  const exact = await findVerbInAnyLanguage(normalized, preferredLanguage);
  if (exact) {
    const data = await getExistingConjugations(exact.infinitive, exact.language);
    return {
      ...base,
      status: 'FOUND',
      match: { language: exact.language, infinitive: exact.infinitive, source: 'EXACT' },
      data: data || undefined
    };
  }

  // 2) Reverse exact (conjugated -> infinitive)
  const reverse = await findConjugatedVerb(normalized, preferredLanguage);
  if (reverse) {
    const data = await getExistingConjugations(reverse.infinitive, reverse.language);
    return {
      ...base,
      status: 'FOUND',
      match: { language: reverse.language, infinitive: reverse.infinitive, source: 'REVERSE_EXACT' },
      message: `Found "${reverse.infinitive}" from conjugated form.`,
      data: data || undefined
    };
  }

  // 3) Fuzzy candidates (lemma + conjugated)
  const lemmaCandidates = await findVerbFuzzyCandidates(normalized, preferredLanguage, 0.40, 10);
  const conjCandidates = await findConjugatedVerbFuzzyCandidates(normalized, preferredLanguage, 0.40, 10);

  // Build suggestions list
  const suggestionsRaw = [
    ...lemmaCandidates.map((c: any) => ({
      language: c.language,
      infinitive: c.infinitive,
      source: 'FUZZY_LEMMA' as const,
      similarity: c.similarity,
    })),
    ...conjCandidates.map((c: any) => ({
      language: c.language,
      infinitive: c.infinitive,
      matchedForm: c.matchedForm,
      source: 'FUZZY_CONJ' as const,
      similarity: c.similarity,
    })),
  ].sort((a, b) => b.similarity - a.similarity);

  // CRITICAL FIX: Filter to ONLY show preferred language suggestions
  // This prevents cross-language pollution (e.g., French "manajar" when Spanish is selected)
  const filteredSuggestions = preferredLanguage
    ? suggestionsRaw.filter(s => s.language === preferredLanguage)
    : suggestionsRaw;

  const suggestions = dedupeSuggestions(filteredSuggestions).slice(0, 5);

  // 3A) Auto-accept fuzzy lemma only if high confidence + margin AND length > 4
  if (lemmaCandidates.length > 0) {
    const best = lemmaCandidates[0];
    const second = lemmaCandidates.length > 1 ? lemmaCandidates[1] : null;

    const minAccept = minAcceptForLen(l);
    const margin = 0.10;

    // CRITICAL: Only auto-accept if language matches preferred language
    const languageMatches = !preferredLanguage || best.language === preferredLanguage;

    const accept =
      l > 4 &&
      languageMatches && // ✅ NEW: Must match preferred language
      shouldAcceptFuzzy(best.similarity, second?.similarity ?? null, minAccept, margin);

    if (accept && !forceAi) { // Don't auto-accept if user is forcing a check
      const data = await getExistingConjugations(best.infinitive, best.language);
      return {
        ...base,
        status: 'FOUND',
        match: { language: best.language, infinitive: best.infinitive, source: 'FUZZY_ACCEPTED', confidence: best.similarity },
        suggestions,
        message: `No exact match for "${raw}". Showing closest match: "${best.infinitive}".`,
        data: data || undefined
      };
    }
  }

  // 3B) If we have suggestions AND NOT forcing AI, return DID_YOU_MEAN
  if (suggestions.length > 0 && !forceAi) {
    return {
      ...base,
      status: 'DID_YOU_MEAN',
      suggestions,
      message: `No exact match for "${raw}". Did you mean one of these?`,
    };
  }

  // 4) Light AI lemma detection (only when no useful suggestions OR forceAi is true)
  const ai = await detectLanguageAndInfinitive(raw, preferredLanguage);

  // If AI fails or confidence is low, return NOT_FOUND
  if (!ai || !ai.infinitive || ai.isVerbLikelihood < 0.70 || ai.lemmaConfidence < 0.70) {
    // Fallback: try to find *any* suggestions even with lower threshold if AI failed
    const fallbackSuggestionsRaw = await getSuggestions(raw, preferredLanguage, 0.2, 5);
    const fallbackSuggestions = fallbackSuggestionsRaw.map((s: any) => ({
      language: s.language,
      infinitive: s.word,
      source: 'NEARBY' as const,
      similarity: s.similarity
    }));

    return {
      ...base,
      status: 'NOT_FOUND',
      message: `No match found for "${raw}".`,
      suggestions: fallbackSuggestions.length > 0 ? fallbackSuggestions : undefined
    };
  }

  const aiLang = (ai.language ?? preferredLanguage) as SupportedLang | undefined;
  if (!aiLang) {
    return { ...base, status: 'NOT_FOUND', message: `Could not determine language for "${raw}".` };
  }

  // CRITICAL: If preferredLanguage is set, and AI detected a different language,
  // do NOT auto-switch. Instead, suggest it.
  const isCrossLanguage = preferredLanguage && aiLang && preferredLanguage !== aiLang;

  // Try exact lookup with AI lemma (maybe we have "comer" but user typed "komer" and fuzzy failed?)
  const exactAiLemma = await findVerbInAnyLanguage(ai.infinitive, aiLang);
  if (exactAiLemma) {
    if (isCrossLanguage) {
      return {
        ...base,
        status: 'DID_YOU_MEAN',
        suggestions: [{
          language: exactAiLemma.language as SupportedLang,
          infinitive: exactAiLemma.infinitive,
          source: 'NEARBY',
          similarity: 0.95
        }],
        message: `No Spanish match. Did you mean "${exactAiLemma.infinitive}" in ${exactAiLemma.language === 'en' ? 'English' : exactAiLemma.language === 'fr' ? 'French' : 'Spanish'}?`
      };
    }

    const data = await getExistingConjugations(exactAiLemma.infinitive, exactAiLemma.language);
    return {
      ...base,
      status: 'FOUND',
      match: {
        language: exactAiLemma.language,
        infinitive: exactAiLemma.infinitive,
        source: 'AI_LEMMA',
        confidence: ai.lemmaConfidence,
      },
      message: `Interpreting "${raw}" as "${exactAiLemma.infinitive}".`,
      data: data || undefined
    };
  }

  // Not in DB: needs generation
  if (isCrossLanguage) {
    return {
      ...base,
      status: 'DID_YOU_MEAN',
      suggestions: [{
        language: aiLang,
        infinitive: ai.infinitive,
        source: 'NEARBY',
        similarity: 0.95
      }],
      message: `No Spanish match. Did you mean "${ai.infinitive}" in ${aiLang}?`
    };
  }

  return {
    ...base,
    status: 'NEEDS_GENERATION',
    needsGeneration: true,
    match: {
      language: aiLang,
      infinitive: ai.infinitive, // asserted non-null above
      source: 'AI_LEMMA',
      confidence: ai.lemmaConfidence,
    },
    message: `Verified "${ai.infinitive}" (${aiLang}) but not cached yet. Generating now...`,
  };
}

/**
 * GENERATE FLOW: idempotent generation with Postgres advisory lock.
 */
export async function generateAndCacheConjugations(params: {
  language: SupportedLang;
  infinitive: string;
}): Promise<SearchResponse & { data?: FullConjugationData }> {
  const { language, infinitive } = params;
  const raw = infinitive;
  const { normalized } = normalizeInput(infinitive);

  const base: SearchResponse = {
    status: 'NOT_FOUND',
    input: { raw, normalized, preferredLanguage: language },
  };

  // 0) If already exists, return it
  const existing = await getExistingConjugations(normalized, language);
  if (existing) {
    return {
      ...base,
      status: 'FOUND',
      match: { language, infinitive: normalized, source: 'EXACT' },
      message: 'Already cached.',
      data: existing,
    };
  }

  // 1) Advisory lock for (language, infinitive)
  // We hash the string key to get a 64-bit int (roughly)
  // Postgres md5 returns hex, we need cast. 
  // Easier: use `hashtext` function in Postgres which returns integer.
  const lockKeyStr = `${language}:${normalized}`;

  // NOTE: Prisma raw query parameterization for simple values
  // We use `SELECT pg_try_advisory_lock(hashtext($1))`

  const lockRow = await prisma.$queryRaw<Array<{ locked: boolean }>>`
    SELECT pg_try_advisory_lock(hashtext(${lockKeyStr})) AS locked
  `;

  // pg_try_advisory_lock returns boolean. 
  // Note: Depending on driver, might need casting. 
  // In typical pg, it returns t/f. 
  const locked = lockRow?.[0]?.locked === true;

  if (!locked) {
    return {
      ...base,
      status: 'NEEDS_GENERATION',
      needsGeneration: true,
      match: { language, infinitive: normalized, source: 'AI_LEMMA' },
      message: 'Generation is already in progress. Please retry shortly.',
    };
  }

  try {
    // 2) Generate
    // Call the heavy LLM function
    const generated = await generateConjugations(normalized, { language, infinitive: normalized });

    // 3) Minimal validation 
    if (!generated?.tenses?.length) {
      throw new Error('Generation returned no tenses.');
    }

    // 4) Save
    const ok = await saveConjugations(generated);
    if (!ok) {
      throw new Error('Failed to save generated conjugations.');
    }

    // 5) Re-read canonical saved data
    const saved = await getExistingConjugations(normalized, language);

    return {
      ...base,
      status: 'FOUND',
      match: { language, infinitive: normalized, source: 'AI_LEMMA' },
      message: 'Generated and cached successfully.',
      data: saved ?? generated,
    };
  } catch (err: any) {
    console.error("Generation failed:", err);
    return {
      ...base,
      status: 'NOT_FOUND',
      message: `Generation failed: ${err.message}`
    };
  } finally {
    // Always unlock
    await prisma.$queryRaw`SELECT pg_advisory_unlock(hashtext(${lockKeyStr}))`;
  }
}
