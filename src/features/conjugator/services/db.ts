import { prisma } from '@/utils/prismaDB';
import { Prisma } from '@prisma/client';
import { FullConjugationData } from '../types';

export async function findVerbInAnyLanguage(verb: string, preferredLanguage?: 'en' | 'fr' | 'es') {
  const normalized = verb.toLowerCase().trim();

  // If preferred language is set, try that first
  if (preferredLanguage) {
    const match = await prisma.contentItem.findFirst({
      where: {
        contentType: 'VERB',
        metadata: {
          path: ['infinitive'],
          equals: normalized,
        },
        language: {
          iso_code: preferredLanguage
        }
      },
      include: {
        language: true,
      },
    });
    if (match) {
      return {
        id: match.id,
        language: match.language.iso_code as 'en' | 'fr' | 'es',
        infinitive: (match.metadata as any).infinitive,
        data: match.metadata as unknown as FullConjugationData // approximate
      };
    }
  }

  // Fallback to any language
  const match = await prisma.contentItem.findFirst({
    where: {
      contentType: 'VERB',
      metadata: {
        path: ['infinitive'],
        equals: normalized,
      },
    },
    include: {
      language: true,
    },
  });

  if (match) {
    return {
      id: match.id,
      language: match.language.iso_code as 'en' | 'fr' | 'es',
      infinitive: (match.metadata as any).infinitive,
      data: match.metadata as unknown as FullConjugationData
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

  // 1. Fetch the content item with conjugation data
  const contentItem = await prisma.contentItem.findFirst({
    where: {
      contentType: 'VERB',
      language: { iso_code: language },
      metadata: {
        path: ['infinitive'],
        equals: normalizedInfinitive,
      },
    },
  });

  if (!contentItem) {
    return null;
  }

  const data = contentItem.metadata as unknown as FullConjugationData;

  const variants = [normalizedInfinitive];
  if (language === 'en') {
    if (normalizedInfinitive.startsWith('to ')) {
      variants.push(normalizedInfinitive.slice(3));
    } else {
      variants.push(`to ${normalizedInfinitive}`);
    }
  }

  // 2. Fetch audio availability from conjugations table
  const audioData = await prisma.$queryRaw<
    Array<{
      display_form: string;
      pronoun_label: string;
      tense_name: string;
      has_audio: boolean;
      audio_file_key: string | null;
    }>
  >`
    SELECT 
      c.display_form,
      p.label as pronoun_label,
      t.tense_name,
      COALESCE(c.has_audio, false) as has_audio,
      c.audio_file_key
    FROM conjugations c
    JOIN verb_translations v ON c.verb_translation_id = v.id
    JOIN languages l ON v.language_id = l.id
    JOIN pronouns p ON c.pronoun_id = p.id
    JOIN tenses t ON c.tense_id = t.id
    WHERE LOWER(v.word) = ANY(${variants})
      AND l.iso_code = ${language}
  `;

  // 3. If no audio data exists, return the raw data
  if (audioData.length === 0) {
    return data;
  }

  // 4. Build lookup map and enrich the data with audio status
  // Simple normalization for matching keys
  const normalizeKey = (s: string) => s.trim().toLowerCase();

  const audioMap = new Map<string, { has_audio: boolean; audio_file_key: string | null }>();

  for (const row of audioData) {
    // Key: tense::pronoun::text
    const exactKey = `${normalizeKey(row.tense_name)}::${normalizeKey(row.pronoun_label)}::${normalizeKey(row.display_form)}`;

    // Also support fallback without pronoun if needed, but primarily exact matches
    // We include audio_file_key exactly as it comes from DB
    audioMap.set(exactKey, {
      has_audio: row.has_audio,
      audio_file_key: row.audio_file_key
    });
  }

  return {
    ...data,
    tenses: data.tenses.map((tense) => ({
      ...tense,
      items: tense.items.map((item) => {
        const tKey = normalizeKey(tense.tense_name);
        const pKey = normalizeKey(item.pronoun);
        const fKey = normalizeKey(item.text);

        const exactKey = `${tKey}::${pKey}::${fKey}`;
        let audioInfo = audioMap.get(exactKey);

        // Fallback for English: some JSON has pronoun in text field (e.g., "I come" vs "come")
        if (!audioInfo && language === 'en') {
          const lowerText = item.text.toLowerCase();
          const lowerPronoun = item.pronoun.toLowerCase();
          if (lowerText.startsWith(lowerPronoun + ' ')) {
            const strippedText = item.text.slice(item.pronoun.length + 1).trim();
            const strippedKey = `${tKey}::${pKey}::${normalizeKey(strippedText)}`;
            audioInfo = audioMap.get(strippedKey);
          }
        }

        return audioInfo
          ? {
            ...item,
            has_audio: audioInfo.has_audio,
            audio_file_key: audioInfo.audio_file_key ?? undefined
          }
          : item;
      }),
    })),
  };
}


// Reverse lookup: check if any conjugated form matches the input
export async function findConjugatedVerb(form: string, preferredLanguage?: 'en' | 'fr' | 'es') {
  const normalized = form.toLowerCase().trim();
  const langFilter = preferredLanguage ? Prisma.sql`AND l.iso_code = ${preferredLanguage}` : Prisma.sql``;

  // Use the same CTE strategy for precise lookup
  const results = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string }>>`
        WITH conjugated_forms AS (
          SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code,
            jsonb_array_elements(c.metadata->'tenses') -> 'items' as conjugations
          FROM "content_items" c
          JOIN "languages" l ON c."languageId" = l.id
          WHERE c."contentType" = 'VERB'
            ${langFilter}
        ),
        forms_expanded AS (
          SELECT 
            infinitive,
            iso_code,
            value->>'text' as display_form
          FROM conjugated_forms,
          jsonb_array_elements(conjugations)
        )
        SELECT 
            infinitive,
            iso_code
        FROM forms_expanded
        WHERE lower(display_form) = ${normalized}
        LIMIT 1
    `;

  if (results.length > 0) {
    return {
      language: results[0].iso_code as 'en' | 'fr' | 'es',
      infinitive: results[0].infinitive
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

  let searchWord = normalized;
  if (preferredLanguage === 'en' && searchWord.startsWith('to ')) {
    searchWord = searchWord.slice(3);
  }

  const langFilter = preferredLanguage ? Prisma.sql`AND l.iso_code = ${preferredLanguage}` : Prisma.sql``;

  const candidates = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string, sim: number }>>`
        SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code,
            similarity(c.metadata->>'infinitive', ${searchWord}) as sim
        FROM "content_items" c
        JOIN "languages" l ON c."languageId" = l.id
        WHERE c."contentType" = 'VERB'
        ${langFilter}
        AND similarity(c.metadata->>'infinitive', ${searchWord}) >= ${threshold}
        ORDER BY sim DESC
        LIMIT ${limit}
    `;

  return candidates.map(c => ({
    language: c.iso_code as 'en' | 'fr' | 'es',
    infinitive: c.infinitive,
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

  // We need to unnest the tenses array, then the items array within each tense
  // to access the text property.
  const candidates = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string, matched_form: string, sim: number }>>`
        WITH conjugated_forms AS (
          SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code,
            jsonb_array_elements(c.metadata->'tenses') -> 'items' as conjugations
          FROM "content_items" c
          JOIN "languages" l ON c."languageId" = l.id
          WHERE c."contentType" = 'VERB'
            ${langFilter}
        ),
        forms_expanded AS (
          SELECT 
            infinitive,
            iso_code,
            value->>'text' as display_form
          FROM conjugated_forms,
          jsonb_array_elements(conjugations)
        )
        SELECT 
            infinitive,
            iso_code,
            display_form as matched_form,
            similarity(display_form, ${normalized}) as sim
        FROM forms_expanded
        WHERE similarity(display_form, ${normalized}) >= ${threshold}
        ORDER BY sim DESC
        LIMIT ${limit}
    `;

  return candidates.map(c => ({
    language: c.iso_code as 'en' | 'fr' | 'es',
    infinitive: c.infinitive,
    matchedForm: c.matched_form,
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
