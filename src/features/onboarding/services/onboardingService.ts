import { prisma } from '@/utils/prismaDB';
import { OnboardingData } from '../types';

export async function getOnboardingProgress(userId: string) {
  return prisma.onboardingProgress.findUnique({
    where: { userId },
  });
}

export async function saveOnboardingProgress(
  userId: string,
  currentStep: number,
  data: OnboardingData
) {
  return prisma.onboardingProgress.upsert({
    where: { userId },
    update: { currentStep, data: data as object, updatedAt: new Date() },
    create: { userId, currentStep, data: data as object },
  });
}

export async function getOnboardingProfile(userId: string) {
  return prisma.userOnboardingProfile.findUnique({
    where: { userId },
  });
}

export async function createOnboardingProfile(
  userId: string,
  data: {
    nativeLanguage: string;
    targetLanguage: string;
    cefrLevel: string;
    learningGoal: string[];
    dailyCommitment: number;
    interests: string[];
  }
) {
  // Delete progress if exists
  await prisma.onboardingProgress.deleteMany({
    where: { userId },
  });

  // Create or update profile
  return prisma.userOnboardingProfile.upsert({
    where: { userId },
    update: {
      ...data,
      completed: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      ...data,
      completed: true,
    },
  });
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { userId },
    select: { completed: true },
  });
  return profile?.completed ?? false;
}
