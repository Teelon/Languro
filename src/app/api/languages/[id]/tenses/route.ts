import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const languageId = parseInt(id);

    if (isNaN(languageId)) {
      return NextResponse.json({ error: 'Invalid language ID' }, { status: 400 });
    }

    const tenses = await prisma.tense.findMany({
      where: {
        language_id: languageId,
        is_literary: false
      },
      select: {
        id: true,
        tense_name: true,
        mood: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({ success: true, tenses });

  } catch (error) {
    console.error('Error fetching tenses for language:', error);
    return NextResponse.json({ error: 'Failed to fetch tenses' }, { status: 500 });
  }
}
