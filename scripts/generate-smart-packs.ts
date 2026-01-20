
import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { MigrationLogger } from './utils/logger';

const logger = new MigrationLogger();

interface PackConfig {
  name: string;
  description: string;
  cefrLevel: string;
  maxVerbs: number;
  criteria: {
    minDifficulty?: number;
    maxDifficulty?: number;
    requiredTags?: string[];
    excludeTags?: string[];
    frequencyPriority?: boolean;
  };
}

async function main() {
  logger.header('SMART TEMPLATE PACK GENERATION');

  const languages = await prisma.language.findMany({
    where: { iso_code: { in: ['es', 'en', 'fr'] } }
  });

  for (const language of languages) {
    logger.section(`Creating packs for ${language.name}`);

    // Get all available verbs for this language
    const availableVerbs = await prisma.contentItem.findMany({
      where: {
        languageId: language.id,
        contentType: 'verb',
        metadata: {
          path: ['hasConjugations'],
          equals: true
        }
      }
    });

    logger.info(`Found ${availableVerbs.length} verbs available`);

    if (availableVerbs.length === 0) {
      logger.warning('No verbs available, skipping');
      continue;
    }

    // Define pack configurations
    const packConfigs: PackConfig[] = [
      {
        name: `Essential ${language.name} Verbs - A1`,
        description: `Your starter pack with ${Math.min(availableVerbs.length, 25)} essential ${language.name} verbs for beginners.`,
        cefrLevel: 'A1',
        maxVerbs: 25,
        criteria: {
          maxDifficulty: 3,
          frequencyPriority: true
        }
      },
      {
        name: `Core ${language.name} Verbs - A2`,
        description: `Expand your vocabulary with intermediate ${language.name} verbs.`,
        cefrLevel: 'A2',
        maxVerbs: Math.min(availableVerbs.length, 30),
        criteria: {
          minDifficulty: 2,
          maxDifficulty: 4,
          frequencyPriority: true
        }
      }
    ];

    for (const config of packConfigs) {
      await createPackFromConfig(language, availableVerbs, config);
    }
  }

  logger.success('\n✅ Smart pack generation complete!');
}

async function createPackFromConfig(
  language: any,
  availableVerbs: any[],
  config: PackConfig
) {
  // Check if pack already exists
  const existing = await prisma.templatePack.findFirst({
    where: {
      languageId: language.id,
      cefrLevel: config.cefrLevel,
      category: 'verbs'
    }
  });

  if (existing) {
    logger.info(`  ⏭️  Pack "${config.name}" already exists, deleting and recreating...`);

    // Delete old items
    await prisma.templatePackItem.deleteMany({
      where: { packId: existing.id }
    });

    // Delete pack
    await prisma.templatePack.delete({
      where: { id: existing.id }
    });
  }

  // Filter verbs based on criteria
  let selectedVerbs = availableVerbs.filter(verb => {
    const metadata = verb.metadata as any;
    const difficulty = metadata.difficulty || 3;
    const tags = metadata.tags || [];

    // Check difficulty range
    if (config.criteria.minDifficulty && difficulty < config.criteria.minDifficulty) {
      return false;
    }
    if (config.criteria.maxDifficulty && difficulty > config.criteria.maxDifficulty) {
      return false;
    }

    // Check required tags
    if (config.criteria.requiredTags) {
      const hasAllRequired = config.criteria.requiredTags.every(tag =>
        tags.includes(tag)
      );
      if (!hasAllRequired) return false;
    }

    // Check excluded tags
    if (config.criteria.excludeTags) {
      const hasExcluded = config.criteria.excludeTags.some(tag =>
        tags.includes(tag)
      );
      if (hasExcluded) return false;
    }

    return true;
  });

  // Sort by priority
  if (config.criteria.frequencyPriority) {
    selectedVerbs.sort((a, b) => {
      const aFreq = getFrequencyScore((a.metadata as any).frequency);
      const bFreq = getFrequencyScore((b.metadata as any).frequency);

      if (aFreq !== bFreq) {
        return bFreq - aFreq; // Higher frequency first
      }

      // Secondary sort by difficulty (easier first)
      const aDiff = (a.metadata as any).difficulty || 3;
      const bDiff = (b.metadata as any).difficulty || 3;
      return aDiff - bDiff;
    });
  }

  // Take top N verbs
  const finalVerbs = selectedVerbs.slice(0, config.maxVerbs);

  if (finalVerbs.length === 0) {
    logger.warning(`  ⚠️  No verbs match criteria for "${config.name}"`);
    return;
  }

  // Create pack
  const pack = await prisma.templatePack.create({
    data: {
      languageId: language.id,
      name: config.name,
      description: config.description,
      category: 'verbs',
      cefrLevel: config.cefrLevel,
      isPublic: true,
      sortOrder: config.cefrLevel === 'A1' ? 1 : 2
    }
  });

  // Add verbs to pack
  await prisma.templatePackItem.createMany({
    data: finalVerbs.map((verb, index) => ({
      packId: pack.id,
      contentItemId: verb.id,
      sortOrder: index
    }))
  });

  logger.success(`  ✓ Created "${config.name}" with ${finalVerbs.length} verbs`);

  // Show sample verbs
  const sampleVerbs = finalVerbs.slice(0, 5).map(v => (v.data as any).infinitive);
  logger.debug(`    Sample: ${sampleVerbs.join(', ')}...`);
}

function getFrequencyScore(frequency: string | undefined): number {
  const scores: Record<string, number> = {
    'very_common': 4,
    'common': 3,
    'moderate': 2,
    'rare': 1
  };
  return scores[frequency || 'moderate'] || 2;
}

main()
  .catch((error) => {
    logger.error(`Pack generation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
