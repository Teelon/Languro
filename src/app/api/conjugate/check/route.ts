import { NextResponse } from 'next/server';
import { searchConjugationsCheck, type SupportedLang } from '../_lib/search';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Accept 'verb' (old) or 'query' (new)
  const query = String(body?.query ?? body?.verb ?? '').trim();
  const preferredLanguage = body?.language as SupportedLang | undefined; // Accept 'language' field
  const forceAi = body?.forceAi === true;

  const result = await searchConjugationsCheck(query, preferredLanguage, forceAi);

  // 200 always for check, client decides next action via status
  return NextResponse.json(result, { status: 200 });
}
