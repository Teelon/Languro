import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { buildDrillSession, getSessionStats } from '@/lib/drill/session-builder';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listId, languageId, count = 20 } = await request.json();

    // Validate count
    if (count < 1 || count > 100) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Build session
    const prompts = await buildDrillSession({
      userId: session.user.id,
      listId,
      languageId,
      count,
      mode: 'random'
    });

    if (prompts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No drill items available. Add verbs to your list first.' },
        { status: 404 }
      );
    }

    // Get stats
    const stats = await getSessionStats(session.user.id, listId);

    return NextResponse.json({
      success: true,
      session: {
        prompts,
        totalQuestions: prompts.length,
        stats
      }
    });

  } catch (error) {
    console.error('Error creating drill session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create drill session' },
      { status: 500 }
    );
  }
}
