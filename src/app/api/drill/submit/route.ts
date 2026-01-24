import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { validateDrillAnswer } from '@/lib/drill/validation';
import { prisma } from '@/utils/prismaDB';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { drillItemId, userInput, timeSpentMs } = await request.json();

    if (!drillItemId || typeof userInput !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Validate the answer
    const validation = await validateDrillAnswer(drillItemId, userInput);

    // Record the attempt and update mastery in a transaction
    const now = new Date();
    const { attempt, mastery } = await prisma.$transaction(async (tx) => {
      // 1. Create Attempt
      const newAttempt = await tx.attempt.create({
        data: {
          userId: session.user.id,
          drillItemId,
          userInput: userInput.trim(),
          isCorrect: validation.isCorrect,
          errorType: validation.errorType,
          errorDetails: validation.errorDetails as any,
          timeSpentMs: timeSpentMs || null,
          attemptedAt: now
        }
      });

      // 2. Update Mastery
      const existingMastery = await tx.mastery.findUnique({
        where: {
          userId_drillItemId: {
            userId: session.user.id,
            drillItemId
          }
        }
      });

      const prevStreak = existingMastery?.correctStreak ?? 0;
      const nextStreak = validation.isCorrect ? prevStreak + 1 : 0;

      // Score update: +0.1 for correct, -0.2 for incorrect (clamped 0..1)
      const prevScore = existingMastery?.score ?? 0;
      let nextScore = validation.isCorrect ? prevScore + 0.1 : prevScore - 0.2;
      nextScore = Math.max(0, Math.min(1, nextScore));

      const { computeNextReviewAt } = await import('@/lib/drill/srs');
      const nextReviewAt = computeNextReviewAt(now, validation.isCorrect, nextStreak);

      const updatedMastery = await tx.mastery.upsert({
        where: {
          userId_drillItemId: {
            userId: session.user.id,
            drillItemId
          }
        },
        create: {
          userId: session.user.id,
          drillItemId,
          score: nextScore,
          correctStreak: nextStreak,
          seenCount: 1,
          lastAttemptAt: now,
          nextReviewAt,
          stage: 'learning' // Default stage
        },
        update: {
          score: nextScore,
          correctStreak: nextStreak,
          seenCount: { increment: 1 },
          lastAttemptAt: now,
          nextReviewAt,
          // We could update stage here based on score/streak thresholds later
        }
      });

      return { attempt: newAttempt, mastery: updatedMastery };
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        isCorrect: validation.isCorrect,
        errorType: validation.errorType,
        expectedAnswer: validation.errorDetails?.expected,
        userAnswer: userInput,
        feedback: generateFeedback(validation),
        mastery: {
          score: mastery.score,
          correctStreak: mastery.correctStreak,
          nextReviewAt: mastery.nextReviewAt
        }
      }
    });

  } catch (error) {
    console.error('Error submitting drill answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

function generateFeedback(validation: any): string {
  if (validation.isCorrect) {
    return 'Correct! Well done!';
  }

  switch (validation.errorType) {
    case 'DIACRITIC_ONLY':
      return 'Almost! Check your accents.';
    case 'WRONG_PERSON':
      return 'Close, but wrong person/pronoun.';
    case 'WRONG_TENSE':
      return 'You used the wrong tense.';
    case 'SPELLING_CLOSE':
      return 'Very close! Check your spelling.';
    default:
      return 'Incorrect. Try again!';
  }
}
