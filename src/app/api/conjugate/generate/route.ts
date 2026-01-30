import { NextResponse } from 'next/server';
import { generateAndCacheConjugations, type SupportedLang } from '../_lib/search';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { trackVocabularyEncounter } from '@/lib/vocabulary/tracking';
import { getLanguageId } from '@/features/conjugator/services/metadata';

export const maxDuration = 60; // Allow 60s for LLM processing

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const language = body?.language as SupportedLang | undefined;
  const infinitive = String(body?.infinitive ?? '').trim();

  if (!language || !['en', 'fr', 'es'].includes(language)) {
    return NextResponse.json({ error: 'Invalid language.' }, { status: 400 });
  }
  if (!infinitive) {
    return NextResponse.json({ error: 'Missing infinitive.' }, { status: 400 });
  }

  const result = await generateAndCacheConjugations({ language, infinitive });

  if (result.status === 'FOUND') {
    (async () => {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          const langId = await getLanguageId(language);
          if (langId) {
            await trackVocabularyEncounter(
              session.user.id,
              langId,
              infinitive
            );
          }
        }
      } catch (err) {
        console.error("Failed to track vocab in generate", err);
      }
    })();
  }

  // If generation is already in progress, return 202 to encourage polling (though our UI might just wait/spin)
  const httpStatus = result.status === 'NEEDS_GENERATION' ? 202 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
