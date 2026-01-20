import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { MigrationLogger } from './utils/logger';

const logger = new MigrationLogger();

interface DrillStats {
  languageName: string;
  contentItems: number;
  drillItemsCreated: number;
  skipped: number;
  failed: number;
  errors: Array<{ verb: string; error: string }>;
}

const DRILL_CONFIG = {
  supportedLanguages: ['es', 'en', 'fr'],
  skipLiterary: true, // Skip literary tenses
  batchSize: 50,
  dryRun: process.env.DRILL_DRY_RUN === 'true',
};

async function main() {
  logger.header('DRILL ITEMS GENERATION');

  if (DRILL_CONFIG.dryRun) {
    logger.warning('DRY RUN MODE - No data will be written');
  }

  const languages = await prisma.language.findMany({
    where: {
      iso_code: { in: DRILL_CONFIG.supportedLanguages }
    }
  });

  logger.success(`Found ${languages.length} languages`);

  const allStats: Record<string, DrillStats> = {};

  for (const language of languages) {
    const stats = await generateDrillsForLanguage(language);
    allStats[language.iso_code] = stats;
  }

  printSummary(allStats);

  const totalFailed = Object.values(allStats).reduce((sum, s) => sum + s.failed, 0);
  if (totalFailed > 0) {
    process.exit(1);
  }
}

async function generateDrillsForLanguage(language: any): Promise<DrillStats> {
  logger.section(`Processing ${language.name} (${language.iso_code})`);

  const stats: DrillStats = {
    languageName: language.name,
    contentItems: 0,
    drillItemsCreated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  // Get all ContentItems for this language
  // @ts-ignore - Prisma client type issue
  const contentItems = await prisma.contentItem.findMany({
    where: {
      languageId: language.id,
      contentType: 'verb'
    }
  });

  stats.contentItems = contentItems.length;
  logger.info(`Found ${contentItems.length} verb content items`);

  if (contentItems.length === 0) {
    logger.warning('No content items found');
    return stats;
  }

  // Process in batches
  const batchSize = DRILL_CONFIG.batchSize;
  const totalBatches = Math.ceil(contentItems.length / batchSize);

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const batch = contentItems.slice(
      batchNum * batchSize,
      (batchNum + 1) * batchSize
    );

    logger.debug(`Processing batch ${batchNum + 1}/${totalBatches}`);

    for (let i = 0; i < batch.length; i++) {
      const contentItem = batch[i];
      const currentIndex = batchNum * batchSize + i + 1;

      try {
        const drillsCreated = await generateDrillsForVerb(contentItem, language);
        stats.drillItemsCreated += drillsCreated;

        logger.progress(
          currentIndex,
          contentItems.length,
          `${(contentItem.data as any).infinitive} (${drillsCreated} drills)`
        );

      } catch (error) {
        stats.failed++;
        stats.errors.push({
          verb: (contentItem.data as any).infinitive,
          error: error instanceof Error ? error.message : String(error)
        });
        logger.error(`Failed: ${(contentItem.data as any).infinitive}`);
      }
    }
  }

  logger.success(`Completed ${language.name}: ${stats.drillItemsCreated} drill items created`);
  return stats;
}

async function generateDrillsForVerb(
  contentItem: any,
  language: any
): Promise<number> {
  const verbTranslationId = (contentItem.data as any).verbTranslationId;
  const infinitive = (contentItem.data as any).infinitive;

  // Get all conjugations for this verb
  const conjugations = await prisma.conjugation.findMany({
    where: {
      verb_translation_id: verbTranslationId,
      ...(DRILL_CONFIG.skipLiterary && {
        tense: {
          is_literary: false
        }
      })
    },
    include: {
      tense: true,
      pronoun: true
    },
    orderBy: [
      { tense_id: 'asc' },
      { pronoun_id: 'asc' }
    ]
  });

  if (conjugations.length === 0) {
    return 0;
  }

  let createdCount = 0;

  for (const conjugation of conjugations) {
    if (!conjugation.tense || !conjugation.pronoun) {
      continue;
    }

    // Check if drill item already exists
    // @ts-ignore - Prisma client type issue
    const existing = await prisma.drillItem.findFirst({
      where: {
        contentItemId: contentItem.id,
        drillType: 'conjugation',
        promptTemplate: {
          path: ['conjugationId'],
          equals: conjugation.id
        }
      }
    });

    if (existing) {
      continue; // Skip if already exists
    }

    // Determine normalization mode based on language
    const normalization = getNormalizationMode(language.iso_code);

    // Calculate drill difficulty
    const drillDifficulty = calculateDrillDifficulty(
      conjugation.tense,
      language.iso_code
    );

    // Generate skill tags
    const skillTags = generateSkillTags(
      conjugation.tense,
      conjugation.pronoun,
      language.iso_code
    );

    // Create DrillItem
    if (!DRILL_CONFIG.dryRun) {
      // @ts-ignore - Prisma client type issue
      await prisma.drillItem.create({
        data: {
          contentItemId: contentItem.id,
          drillType: 'conjugation',
          promptTemplate: {
            conjugationId: conjugation.id,
            tenseId: conjugation.tense_id,
            pronounId: conjugation.pronoun_id,
            infinitive: infinitive,
            tenseName: conjugation.tense.tense_name,
            mood: conjugation.tense.mood,
            pronounLabel: conjugation.pronoun.label,
            pronounCode: conjugation.pronoun.code,
            languageCode: language.iso_code
          },
          validationRule: {
            conjugationId: conjugation.id,
            expectedForm: conjugation.display_form,
            normalization: normalization
          },
          metadata: {
            difficulty: drillDifficulty,
            skillTags: skillTags,
            languageCode: language.iso_code,
            tenseCategory: conjugation.tense.mood || 'Indicative',
            createdAt: new Date().toISOString()
          }
        }
      });
    }

    createdCount++;
  }

  return createdCount;
}

function getNormalizationMode(languageCode: string): string {
  switch (languageCode) {
    case 'es':
    case 'fr':
      return 'lenient_accents'; // Spanish and French use accents
    case 'en':
      return 'strict'; // English doesn't use accents
    default:
      return 'lenient_accents';
  }
}

function calculateDrillDifficulty(tense: any, languageCode: string): number {
  const difficultyMaps: Record<string, Record<string, number>> = {
    es: {
      'Present': 1,
      'Preterite': 2,
      'Imperfect': 2,
      'Future': 2,
      'Conditional': 3,
      'Present Perfect': 2,
      'Present Subjunctive': 4,
      'Imperfect Subjunctive': 5,
      'Future Subjunctive': 5
    },
    fr: {
      'Présent': 1,
      'Passé Composé': 2,
      'Imparfait': 2,
      'Futur Simple': 2,
      'Conditionnel': 3,
      'Subjonctif Présent': 4,
      'Subjonctif Imparfait': 5,
      'Passé Simple': 4
    },
    en: {
      'Present': 1,
      'Past': 1,
      'Present Perfect': 2,
      'Past Perfect': 3,
      'Future': 1,
      'Present Continuous': 1,
      'Past Continuous': 2
    }
  };

  const map = difficultyMaps[languageCode] || {};
  return map[tense.tense_name] || 3;
}

function generateSkillTags(
  tense: any,
  pronoun: any,
  languageCode: string
): string[] {
  const tags = [
    languageCode,
    tense.tense_name.toLowerCase().replace(/ /g, '_'),
    `${pronoun.code}_form`,
    (tense.mood || 'Indicative').toLowerCase()
  ];

  // Add tense family tags
  if (tense.tense_name.includes('Subjunctive')) {
    tags.push('subjunctive_mood');
  }
  if (tense.tense_name.includes('Perfect')) {
    tags.push('compound_tense');
  }
  if (tense.tense_name.includes('Continuous') || tense.tense_name.includes('Progressive')) {
    tags.push('progressive_aspect');
  }

  return tags;
}

function printSummary(allStats: Record<string, DrillStats>) {
  console.log('\n' + '='.repeat(70));
  console.log('  DRILL GENERATION SUMMARY');
  console.log('='.repeat(70));

  let totalContentItems = 0;
  let totalDrillItems = 0;
  let totalFailed = 0;

  for (const [code, stats] of Object.entries(allStats)) {
    console.log(`\n${stats.languageName}:`);
    console.log(`  Content Items:     ${stats.contentItems}`);
    console.log(`  ✓ Drills Created:  ${stats.drillItemsCreated}`);
    console.log(`  ⏭  Skipped:         ${stats.skipped}`);
    console.log(`  ✗ Failed:          ${stats.failed}`);

    if (stats.drillItemsCreated > 0) {
      const avg = (stats.drillItemsCreated / stats.contentItems).toFixed(1);
      console.log(`  📊 Avg per verb:   ${avg} drills`);
    }

    if (stats.errors.length > 0) {
      console.log('\n  Errors:');
      stats.errors.slice(0, 3).forEach(err => {
        console.log(`    • ${err.verb}: ${err.error}`);
      });
      if (stats.errors.length > 3) {
        console.log(`    ... and ${stats.errors.length - 3} more`);
      }
    }

    totalContentItems += stats.contentItems;
    totalDrillItems += stats.drillItemsCreated;
    totalFailed += stats.failed;
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`Overall: ${totalDrillItems} drill items from ${totalContentItems} verbs`);
  if (totalContentItems > 0) {
    const avg = (totalDrillItems / totalContentItems).toFixed(1);
    console.log(`Average: ${avg} drills per verb`);
  }
  console.log('='.repeat(70) + '\n');
}

main()
  .then(() => {
    logger.success('Drill generation completed!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Drill generation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
