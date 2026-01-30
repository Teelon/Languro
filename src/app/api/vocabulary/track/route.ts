import { NextResponse } from 'next/server';
import { trackVocabularyEncounter } from '@/lib/vocabulary/tracking';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { languageId, word, contentItemId } = body;

    if (!languageId || !word || isNaN(Number(languageId))) {
      return NextResponse.json({ error: 'Missing or invalid languageId or word' }, { status: 400 });
    }

    const result = await trackVocabularyEncounter(
      session.user.id,
      Number(languageId),
      word,
      contentItemId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in vocabulary track API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
