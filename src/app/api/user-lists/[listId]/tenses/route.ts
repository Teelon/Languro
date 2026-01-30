
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listId } = await params;

    // 1. Get List to find languageId
    const list = await prisma.userList.findUnique({
      where: { id: listId },
      select: { languageId: true, userId: true }
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    // 2. Get available tenses for this language
    const tenses = await prisma.tense.findMany({
      where: {
        language_id: list.languageId,
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
    console.error('Error fetching tenses for list:', error);
    return NextResponse.json({ error: 'Failed to fetch tenses' }, { status: 500 });
  }
}
