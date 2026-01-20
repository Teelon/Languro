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

    // Record the attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        drillItemId,
        userInput: userInput.trim(),
        isCorrect: validation.isCorrect,
        errorType: validation.errorType,
        errorDetails: validation.errorDetails as any,
        timeSpentMs: timeSpentMs || null,
        attemptedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        isCorrect: validation.isCorrect,
        errorType: validation.errorType,
        expectedAnswer: validation.errorDetails?.expected,
        userAnswer: userInput,
        feedback: generateFeedback(validation)
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
