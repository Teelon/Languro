import { NextResponse } from 'next/server';
import { searchConjugationsCheck, type SupportedLang, type SearchResponse } from '../_lib/search';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { trackVocabularyEncounter } from '@/lib/vocabulary/tracking';
import { getLanguageId } from '@/features/conjugator/services/metadata';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Accept 'verb' (old) or 'query' (new)
  const query = String(body?.query ?? body?.verb ?? '').trim();
  const preferredLanguage = body?.language as SupportedLang | undefined; // Accept 'language' field
  const forceAi = body?.forceAi === true;

  const result = await searchConjugationsCheck(query, preferredLanguage, forceAi);

  // Track if found
  if (result.status === 'FOUND' && result.match) {
    const match = result.match;
    // Fire-and-forget tracking
    (async () => {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          const langId = await getLanguageId(match.language);
          if (langId) {
            await trackVocabularyEncounter(
              session.user.id,
              langId,
              match.infinitive
            );
          }
        }
      } catch (err) {
        console.error("Failed to track vocab in check", err);
      }
    })();
  }

  // 200 always for check, client decides next action via status
  return NextResponse.json(result, { status: 200 });
}
