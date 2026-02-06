import { prisma } from '@/utils/prismaDB';
import { Prisma } from '@prisma/client';
import { FullConjugationData } from '../types';

export async function findVerbInAnyLanguage(verb: string, preferredLanguage?: 'en' | 'fr' | 'es') {
  const normalized = verb.toLowerCase().trim();

  // Logic to handle English "to " prefix
  const searchWords = [normalized];
  // If we suspect English (either preferred or searching all), add "to " variant if missing
  if ((!preferredLanguage || preferredLanguage === 'en') && !normalized.startsWith('to ')) {
    searchWords.push(`to ${normalized}`);
  }

  // Search VerbTranslation table (Canonical Source)
  const translationMatch = await prisma.verbTranslation.findFirst({
    where: {
      AND: [
        preferredLanguage ? { language: { iso_code: preferredLanguage } } : {},
        {
          word: { in: searchWords, mode: 'insensitive' }
        }
      ]
    },
    include: {
      language: true
    }
  });

  if (translationMatch) {
    // Return the infinitive as stored in verb_translations
    // getExistingConjugations will handle English "to " prefix variations
    return {
      language: translationMatch.language.iso_code as 'en' | 'fr' | 'es',
      infinitive: translationMatch.word
    };
  }

  return null;
}


/**
 * Fetches conjugation data with audio availability in one flow.
 * Pulls content from content_items.metadata and enriches with audio status
 * from the conjugations table (populated by the Airflow TTS pipeline).
 */
export async function getExistingConjugations(infinitive: string, language: 'en' | 'fr' | 'es'): Promise<FullConjugationData | null> {
  const normalizedInfinitive = infinitive.toLowerCase().trim();

  // Build search variants for English "to " prefix
  const variants = [normalizedInfinitive];
  if (language === 'en') {
    if (normalizedInfinitive.startsWith('to ')) {
      variants.push(normalizedInfinitive.slice(3));
    } else {
      variants.push(`to ${normalizedInfinitive}`);
    }
  }

  // Query the view for all conjugation data
  const rows = await prisma.vwFullConjugation.findMany({
    where: {
      language,
      infinitive: { in: variants, mode: 'insensitive' }
    }
  });

  if (rows.length === 0) {
    return null;
  }

  // Get verb info from first row
  const firstRow = rows[0];
  const verbInfinitive = firstRow.infinitive;
  const concept = firstRow.concept || verbInfinitive;
  const definition = firstRow.definition || '';

  // Group by tense
  const tenseMap = new Map<string, {
    tense_name: string;
    mood?: string;
    items: FullConjugationData['tenses'][0]['items'];
  }>();

  for (const row of rows) {
    const tenseKey = `${row.tenseName}::${row.mood || ''}`;

    if (!tenseMap.has(tenseKey)) {
      tenseMap.set(tenseKey, {
        tense_name: row.tenseName,
        mood: row.mood || undefined,
        items: []
      });
    }

    const tense = tenseMap.get(tenseKey)!;
    tense.items.push({
      pronoun: row.pronoun,
      text: row.text,
      auxiliary: row.auxiliary || undefined,
      root: row.root || undefined,
      ending: row.ending || undefined,
      pronoun_id: row.pronounId,
      tense_id: row.tenseId,
      has_audio: row.hasAudio,
      audio_file_key: row.audioFileKey || undefined,
      conjugation_id: row.conjugationId,
      vote_score: row.voteScore
    });
  }

  return {
    concept,
    definition,
    infinitive: verbInfinitive,
    language,
    metadata: {
      source: 'db-cache'
    },
    tenses: Array.from(tenseMap.values())
  };
}



// Reverse lookup: check if any conjugated form matches the input
export async function findConjugatedVerb(form: string, preferredLanguage?: 'en' | 'fr' | 'es') {
  const normalized = form.toLowerCase().trim();

  // Search directly in the conjugations table
  // We join with VerbTranslation to get the infinitive and Language to filter
  const match = await prisma.conjugation.findFirst({
    where: {
      display_form: { equals: normalized, mode: 'insensitive' },
      verb_translation: {
        language: preferredLanguage ? { iso_code: preferredLanguage } : undefined
      }
    },
    include: {
      verb_translation: {
        include: {
          language: true
        }
      }
    }
  });

  if (match && match.verb_translation) {
    // getExistingConjugations now uses the view which handles "to " prefix variations
    return {
      language: match.verb_translation.language.iso_code as 'en' | 'fr' | 'es',
      infinitive: match.verb_translation.word
    };
  }

  return null;
}

export async function saveConjugations(data: FullConjugationData) {
  if (!data.language || !data.infinitive) return false;

  const lang = await prisma.language.findUnique({ where: { iso_code: data.language } });
  if (!lang) return false;

  // Use a unique constraint if possible, but we don't have one for (lang, contentType, infinitive)
  // We can just query and update manually.
  const existing = await prisma.contentItem.findFirst({
    where: {
      contentType: 'VERB',
      languageId: lang.id,
      metadata: {
        path: ['infinitive'],
        equals: data.infinitive
      }
    }
  });

  try {
    if (existing) {
      await prisma.contentItem.update({
        where: { id: existing.id },
        data: { metadata: data as any }
      });
    } else {
      // Need verbTranslationId? Schema says optional. 
      // We'll leave it null for now or implement logic to find/create VerbTranslation if strict.
      await prisma.contentItem.create({
        data: {
          contentType: 'VERB',
          languageId: lang.id,
          metadata: data as any,
        }
      });
    }
    return true;
  } catch (e) {
    console.error("Failed to save conjugations", e);
    return false;
  }
}

// FUZZY MATCHING

export interface FuzzyCandidate {
  language: 'en' | 'fr' | 'es';
  infinitive: string;
  similarity: number;
  matchedForm?: string;
}

export async function findVerbFuzzyCandidates(
  word: string,
  preferredLanguage: 'en' | 'fr' | 'es' | undefined,
  threshold: number = 0.3,
  limit: number = 5
): Promise<FuzzyCandidate[]> {
  const normalized = word.toLowerCase().trim();

  // If we are searching relative to a specific language, we might want to adjust the search term
  // e.g. if user types "run" and lang is EN, we might want to fuzzy match "to run" too.
  // But pg_trgm similarity logic on "run" vs "to run" matches moderately well. 
  // Let's stick to the raw input but ensure we strip "to " if user provided it redundantly?
  // Actually, standardizing on the DB content is better.

  const langFilter = preferredLanguage ? Prisma.sql`AND l.iso_code = ${preferredLanguage}` : Prisma.sql``;

  // Query verb_translations
  const candidates = await prisma.$queryRaw<Array<{ word: string, iso_code: string, sim: number }>>`
        SELECT 
            v.word,
            l.iso_code,
            similarity(v.word, ${normalized}) as sim
        FROM "verb_translations" v
        JOIN "languages" l ON v.language_id = l.id
        WHERE 1=1
        ${langFilter}
        AND similarity(v.word, ${normalized}) >= ${threshold}
        ORDER BY sim DESC
        LIMIT ${limit}
    `;

  return candidates.map(c => ({
    language: c.iso_code as 'en' | 'fr' | 'es',
    infinitive: c.word,
    similarity: c.sim
  }));
}

export async function findConjugatedVerbFuzzyCandidates(
  word: string,
  preferredLanguage: 'en' | 'fr' | 'es' | undefined,
  threshold: number = 0.3,
  limit: number = 5
): Promise<FuzzyCandidate[]> {
  const normalized = word.toLowerCase().trim();
  if (!normalized) return [];

  const langFilter = preferredLanguage ? Prisma.sql`AND l.iso_code = ${preferredLanguage}` : Prisma.sql``;

  // Query conjugations table directly
  const candidates = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string, display_form: string, sim: number }>>`
        SELECT 
            v.word as infinitive,
            l.iso_code,
            c.display_form,
            similarity(c.display_form, ${normalized}) as sim
        FROM "conjugations" c
        JOIN "verb_translations" v ON c.verb_translation_id = v.id
        JOIN "languages" l ON v.language_id = l.id
        WHERE 1=1
        ${langFilter}
        AND similarity(c.display_form, ${normalized}) >= ${threshold}
        ORDER BY sim DESC
        LIMIT ${limit}
    `;

  return candidates.map(c => ({
    language: c.iso_code as 'en' | 'fr' | 'es',
    infinitive: c.infinitive,
    matchedForm: c.display_form,
    similarity: c.sim
  }));
}

export async function getSuggestions(query: string, preferredLanguage?: 'en' | 'fr' | 'es', threshold = 0.2, limit = 5) {
  return findVerbFuzzyCandidates(query, preferredLanguage, threshold, limit).then(res =>
    res.map(c => ({ word: c.infinitive, language: c.language, similarity: c.similarity }))
  );
}

export async function submitFeedback(
  conjugationId: number,
  voteType: 'up' | 'down',
  reason: string | undefined,
  ipHash: string,
  userId?: string
) {
  try {
    await prisma.conjugationFeedback.create({
      data: {
        conjugation_id: conjugationId,
        vote_type: voteType,
        reason,
        ip_hash: ipHash,
        user_id: userId
      }
    });
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { success: false, message: 'You have already voted on this item.' };
    }
    console.error("Feedback error", e);
    return { success: false, message: 'Database error' };
  }
}
