import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { createOnboardingProfile } from '@/features/onboarding/services/onboardingService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nativeLanguage,
      targetLanguage,
      cefrLevel,
      learningGoal,
      dailyCommitment,
      interests,
    } = body;

    // Validation
    if (
      !nativeLanguage ||
      !targetLanguage ||
      !cefrLevel ||
      !learningGoal ||
      learningGoal.length === 0 ||
      !dailyCommitment ||
      !interests ||
      interests.length < 3
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Prevent same language selection
    if (nativeLanguage === targetLanguage) {
      return NextResponse.json(
        { error: 'Native and target language cannot be the same' },
        { status: 400 }
      );
    }


    const profile = await createOnboardingProfile(session.user.id, {
      nativeLanguage,
      targetLanguage,
      cefrLevel,
      learningGoal,
      dailyCommitment,
      interests,
    });



    return NextResponse.json({ profile, success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
