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

export async function getExistingConjugations(infinitive: string, language: 'en' | 'fr' | 'es') {
  const match = await prisma.contentItem.findFirst({
    where: {
      contentType: 'VERB',
      language: { iso_code: language },
      metadata: {
        path: ['infinitive'],
        equals: infinitive.toLowerCase().trim(),
      },
    },
  });

  if (match) {
    return match.metadata as unknown as FullConjugationData;
  }
  return null;
}

// Reverse lookup: check if any conjugated form matches the input
export async function findConjugatedVerb(form: string, preferredLanguage?: 'en' | 'fr' | 'es') {
  const normalized = form.toLowerCase().trim();
  const langFilter = preferredLanguage ? Prisma.sql`AND l.iso_code = ${preferredLanguage}` : Prisma.sql``;

  const results = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string }>>`
        SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code
        FROM "content_items" c
        JOIN "languages" l ON c."languageId" = l.id
        WHERE c."contentType" = 'VERB'
        ${langFilter}
        AND (c.metadata::text ILIKE ${'%' + normalized + '%'}) -- Quick filter
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

  const candidates = await prisma.$queryRaw<Array<{ infinitive: string, iso_code: string, sim: number }>>`
        SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code,
            similarity(c.metadata->>'infinitive', ${normalized}) as sim
        FROM "content_items" c
        JOIN "languages" l ON c."languageId" = l.id
        WHERE c."contentType" = 'VERB'
        ${langFilter}
        AND similarity(c.metadata->>'infinitive', ${normalized}) >= ${threshold}
        ORDER BY sim DESC
        LIMIT ${limit}
    `;

  return candidates.map(c => ({
    language: c.iso_code as 'en' | 'fr' | 'es',
    infinitive: c.infinitive,
    matchedForm: c.infinitive, // placeholder
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
