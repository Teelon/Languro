
import { prisma } from "@/utils/prismaDB";

/**
 * Tracks a user's encounter with a specific vocabulary word.
 * If the word has been seen before, it updates the lastSeenAt timestamp and increments the encounterCount.
 * If it's a new word, it creates a new UserVocabulary record.
 * 
 * @param userId The ID of the user
 * @param languageId The ID of the language
 * @param word The word encountered
 * @param contentItemId Optional ID of the content item where the word was encountered
 */
export async function trackVocabularyEncounter(
  userId: string,
  languageId: number,
  word: string,
  contentItemId?: string
) {
  // basic normalization
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) return null;

  try {
    // We use upsert to handle race conditions better, 
    // although with the unique constraint findUnique + create/update is also fine 
    // but upsert is cleaner.

    return await prisma.userVocabulary.upsert({
      where: {
        userId_languageId_word: {
          userId,
          languageId,
          word: normalizedWord,
        },
      },
      update: {
        lastSeenAt: new Date(),
        encounterCount: { increment: 1 },
        ...(contentItemId ? { contentItemId } : {}),
      },
      create: {
        userId,
        languageId,
        word: normalizedWord,
        contentItemId,
        encounterCount: 1,
        lastSeenAt: new Date(),
        firstSeenAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error tracking vocabulary:", error);
    // Return null to avoid breaking the calling flow
    return null;
  }
}

/**
 * Retrieves the user's vocabulary for a specific language.
 */
export async function getUserVocabulary(userId: string, languageId: number, limit = 100, offset = 0) {
  return await prisma.userVocabulary.findMany({
    where: {
      userId,
      languageId,
    },
    orderBy: {
      lastSeenAt: 'desc',
    },
    skip: offset,
    take: limit,
    include: {
      contentItem: {
        select: {
          contentType: true
        }
      }
    }
  });
}

/**
 * Get simple stats for user vocabulary
 */
export async function getUserVocabularyStats(userId: string, languageId: number) {
  const totalWords = await prisma.userVocabulary.count({
    where: { userId, languageId }
  });

  const recentlySeen = await prisma.userVocabulary.count({
    where: {
      userId,
      languageId,
      lastSeenAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
      }
    }
  });

  return { totalWords, recentlySeen };
}
