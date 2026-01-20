import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionStart = searchParams.get('sessionStart');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!sessionStart) {
      return NextResponse.json(
        { success: false, error: 'sessionStart timestamp required' },
        { status: 400 }
      );
    }

    const startTime = new Date(sessionStart);

    // Get attempts from this session
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id,
        attemptedAt: {
          gte: startTime
        }
      },
      include: {
        drillItem: {
          include: {
            contentItem: true
          }
        }
      },
      orderBy: {
        attemptedAt: 'asc'
      },
      take: limit
    });

    // Calculate stats
    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Group errors by type
    const errorsByType = attempts
      .filter(a => !a.isCorrect && a.errorType)
      .reduce((acc, attempt) => {
        const type = attempt.errorType || 'OTHER';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate average time
    const validTimes = attempts
      .filter(a => a.timeSpentMs && a.timeSpentMs > 0)
      .map(a => a.timeSpentMs!);
    const avgTime = validTimes.length > 0
      ? Math.round(validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length)
      : null;

    return NextResponse.json({
      success: true,
      results: {
        summary: {
          total,
          correct,
          incorrect: total - correct,
          accuracy,
          avgTimeMs: avgTime
        },
        errorBreakdown: errorsByType,
        attempts: attempts.map(a => ({
          id: a.id,
          verb: (a.drillItem.contentItem.data as any).infinitive,
          userInput: a.userInput,
          isCorrect: a.isCorrect,
          errorType: a.errorType,
          expectedAnswer: (a.errorDetails as any)?.expected,
          timeSpentMs: a.timeSpentMs
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching drill results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
