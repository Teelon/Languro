'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { revalidatePath } from 'next/cache';

export async function getAccountData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      onboardingProfile: true,
      preferences: true,
    } as any, // Cast to any to avoid stale type errors
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const nativeLanguage = formData.get('nativeLanguage') as string;
  const targetLanguage = formData.get('targetLanguage') as string;
  const cefrLevel = formData.get('cefrLevel') as string;
  // Handling arrays for learning goals and interests might require parsing JSON or multiple entries
  // For simplicity, assuming they might be passed as JSON strings or we handle them in a client component before sending types
  // But FormData usually sends repeated keys. Let's assume JSON string for arrays for cleaner handling if not using direct server action binding with complex objects

  // A better approach for complex forms is passing a plain object instead of FormData, 
  // but if we stick to FormData:
  const learningGoal = JSON.parse(formData.get('learningGoal') as string || '[]');
  const interests = JSON.parse(formData.get('interests') as string || '[]');

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      onboardingProfile: {
        upsert: {
          create: {
            nativeLanguage,
            targetLanguage,
            cefrLevel,
            learningGoal,
            interests,
            dailyCommitment: 15, // Default or fetch from form
          },
          update: {
            nativeLanguage,
            targetLanguage,
            cefrLevel,
            learningGoal,
            interests,
          },
        },
      },
    },
  });

  revalidatePath('/account');
}

export async function updatePreferences(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Prepare data by removing any potentially undefined or null fields if necessary, 
  // or just pass them as they match the schema.

  // We need to destructure to ensure only valid fields are passed or handle type safety.
  // For now, passing 'data' directly to update since it should match the shape roughly.
  // Ideally use Zod for validation.

  // Remove id and userId if present to avoid errors
  const { id, userId, ...updateData } = data;

  await (prisma as any).userPreferences.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...updateData
    },
    update: {
      ...updateData
    }
  });

  revalidatePath('/account');
}
