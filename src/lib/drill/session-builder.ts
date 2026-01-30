import { prisma } from '@/utils/prismaDB';

export interface SessionConfig {
  userId: string;
  listId?: string;
  languageId?: number;
  count: number;
  mode?: 'random' | 'smart'; // 'smart' will come later with SRS
  tenses?: string[];
}

export interface DrillPrompt {
  drillItemId: string;
  infinitive: string;
  tense: string;
  tenseName: string;
  mood: string;
  pronoun: string;
  pronounLabel: string;
  languageCode: string;
  languageName: string;
}

/**
 * Build a drill session for a user
 */
export async function buildDrillSession(
  config: SessionConfig
): Promise<DrillPrompt[]> {

  // Build query conditions
  const whereConditions: any = {
    contentItem: {
      userListItems: {
        some: {
          list: {
            userId: config.userId,
            isActive: true
          }
        }
      }
    }
  };

  // Filter by specific list if provided
  if (config.listId) {
    whereConditions.contentItem.userListItems.some.listId = config.listId;
  }

  // Filter by language if provided
  if (config.languageId) {
    whereConditions.contentItem.languageId = config.languageId;
  }

  // Filter by tenses if provided
  if (config.tenses && config.tenses.length > 0) {
    const tenseFilters = config.tenses.map(tense => ({
      promptTemplate: {
        path: ['tenseName'],
        equals: tense
      }
    }));

    // If multiple tenses, we use OR
    if (tenseFilters.length === 1) {
      whereConditions.promptTemplate = tenseFilters[0].promptTemplate;
    } else {
      whereConditions.OR = tenseFilters;
    }
  }

  // Fetch drill items
  const drillItems = await prisma.drillItem.findMany({
    where: whereConditions,
    include: {
      contentItem: {
        include: {
          language: true
        }
      }
    },
    take: config.count * 3 // Get more than needed for randomization
  });

  if (drillItems.length === 0) {
    return [];
  }

  // Shuffle and select
  const shuffled = drillItems.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, config.count);

  // Convert to prompts
  const prompts: DrillPrompt[] = selected.map(item => {
    const template = item.promptTemplate as any;
    return {
      drillItemId: item.id,
      infinitive: template.infinitive,
      tense: template.tenseName,
      tenseName: template.tenseName,
      mood: template.mood || 'Indicative',
      pronoun: template.pronounCode,
      pronounLabel: template.pronounLabel,
      languageCode: template.languageCode,
      languageName: item.contentItem.language.name
    };
  });

  return prompts;
}

/**
 * Get session statistics
 */
export async function getSessionStats(userId: string, listId?: string) {
  const whereConditions: any = {
    contentItem: {
      userListItems: {
        some: {
          list: {
            userId,
            isActive: true,
            ...(listId && { id: listId })
          }
        }
      }
    }
  };

  const totalDrills = await prisma.drillItem.count({
    where: whereConditions
  });

  const uniqueVerbs = await prisma.contentItem.count({
    where: {
      userListItems: {
        some: {
          list: {
            userId,
            isActive: true,
            ...(listId && { id: listId })
          }
        }
      }
    }
  });

  return {
    totalDrills,
    uniqueVerbs,
    recommended: Math.min(20, totalDrills)
  };
}
