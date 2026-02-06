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

  // 1. Search VerbTranslation table (Canonical Source)
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
      language: true,
      contentItems: {
        where: { contentType: 'VERB' },
        take: 1
      }
    }
  });

  if (translationMatch) {
    let contentItem: typeof translationMatch.contentItems[0] | null = translationMatch.contentItems[0];

    // Fallback: If not linked via relation, search ContentItem by canonical word
    if (!contentItem) {
      // For English, we unfortunately have a mix of "to run" and "run" in metadata.
      // We must check both variations if the canonical word starts with "to ".
      const searchValues = [translationMatch.word];
      if (translationMatch.language.iso_code === 'en' && translationMatch.word.toLowerCase().startsWith('to ')) {
        searchValues.push(translationMatch.word.slice(3)); // "run"
      }

      contentItem = await prisma.contentItem.findFirst({
        where: {
          contentType: 'VERB',
          languageId: translationMatch.language.id,
          OR: searchValues.map(val => ({
            metadata: {
              path: ['infinitive'],
              equals: val
            }
          }))
        }
      });
    }

    if (contentItem) {
      // IMPORTANT: Use the infinitive from ContentItem metadata for consistency
      // because getExistingConjugations searches by this value, not VerbTranslation.word
      const metaInfinitive = (contentItem.metadata as any)?.infinitive || translationMatch.word;
      return {
        id: contentItem.id,
        language: translationMatch.language.iso_code as 'en' | 'fr' | 'es',
        infinitive: metaInfinitive,
        data: contentItem.metadata as unknown as FullConjugationData
      };
    }
  }

  // If strict language preference is set, we stop here (except for potential cross-lang suggestions which are handled by the caller or separate fuzzy search).
  // But strictly speaking, if we didn't find it in the preferred language, we return null.
  // Exception: If NO preferred language was set, we might have missed it if it was a different language?
  // The query above handles "any language" if preferredLanguage is undefined.

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
    // We need to find the ContentItem to get the correct metadata infinitive
    // (to match what getExistingConjugations expects)
    const langId = match.verb_translation.language.id;
    const translationWord = match.verb_translation.word;

    // Build search values (handle English "to " prefix)
    const searchValues = [translationWord];
    if (match.verb_translation.language.iso_code === 'en' && translationWord.toLowerCase().startsWith('to ')) {
      searchValues.push(translationWord.slice(3));
    }

    const contentItem = await prisma.contentItem.findFirst({
      where: {
        contentType: 'VERB',
        languageId: langId,
        OR: searchValues.map(val => ({
          metadata: {
            path: ['infinitive'],
            equals: val
          }
        }))
      }
    });

    // Use metadata infinitive if found, else fallback to translation word
    const infinitive = (contentItem?.metadata as any)?.infinitive || translationWord;

    return {
      language: match.verb_translation.language.iso_code as 'en' | 'fr' | 'es',
      infinitive
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
