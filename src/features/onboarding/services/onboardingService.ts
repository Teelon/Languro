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

  const { nativeLanguage, targetLanguage, ...rest } = data;

  // Create or update profile
  return prisma.userOnboardingProfile.upsert({
    where: { userId },
    update: {
      ...rest,
      nativeLanguage: { connect: { iso_code: nativeLanguage } },
      targetLanguage: { connect: { iso_code: targetLanguage } },
      completed: true,
      updatedAt: new Date(),
    },
    create: {
      user: { connect: { id: userId } },
      ...rest,
      nativeLanguage: { connect: { iso_code: nativeLanguage } },
      targetLanguage: { connect: { iso_code: targetLanguage } },
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
