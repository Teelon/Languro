
import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { MIGRATION_CONFIG } from './config/migration-config';
import { MigrationLogger } from './utils/logger';
import { GeminiVerbClassifier } from './services/llm-classifier';
import { estimateDifficulty } from './utils/difficulty-estimator';
import { classifyVerb } from './utils/verb-classifier';

// const prisma = new PrismaClient({}); // Replaced by import
const logger = new MigrationLogger(MIGRATION_CONFIG.verboseLogging);
// Ensure we handle missing key gracefully in constructor or here. 
// The class handles check inside classifyBatch, but better to check environment before instantiation if it throws in constructor.
// Based on my implementation of GeminiVerbClassifier:
const geminiClassifier = new GeminiVerbClassifier();

interface MigrationStats {
  languageName: string;
  totalVerbs: number;
  migrated: number;
  skipped: number;
  failed: number;
  llmClassified: number;
  ruleClassified: number;
  errors: Array<{ verb: string; error: string }>;
}

async function main() {
  logger.header('VERB TO CONTENT MIGRATION');

  if (!process.env.GEMINI_API_KEY && MIGRATION_CONFIG.useLLM) {
    logger.error('GEMINI_API_KEY not found in environment');
    logger.info('Get your API key at: https://makersuite.google.com/app/apikey');
    if (!MIGRATION_CONFIG.fallbackToRules) {
      process.exit(1);
    } else {
      logger.warning('Proceeding with Rules fallback only.');
    }
  }

  if (MIGRATION_CONFIG.dryRun) {
    logger.warning('DRY RUN MODE - No data will be written');
  }

  const languages = await prisma.language.findMany({
    where: {
      iso_code: { in: (MIGRATION_CONFIG.supportedLanguages as unknown as string[]) }
    }
  });

  logger.success(`Found ${languages.length} languages: ${languages.map((l: any) => l.name).join(', ')}`);

  const allStats: Record<string, MigrationStats> = {};

  for (const language of languages) {
    const stats = await migrateLanguageVerbs(language);
    allStats[language.iso_code] = stats;
  }

  logger.summary(allStats);

  const totalFailed = Object.values(allStats).reduce((sum, s) => sum + s.failed, 0);
  if (totalFailed > 0) {
    // We don't necessarily want to fail the pipeline if some verbs failed, unless critical
    // process.exit(1); 
  }
}

async function migrateLanguageVerbs(language: any): Promise<MigrationStats> {
  logger.section(`Processing ${language.name} (${language.iso_code})`);

  const stats: MigrationStats = {
    languageName: language.name,
    totalVerbs: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    llmClassified: 0,
    ruleClassified: 0,
    errors: []
  };

  const totalCount = await prisma.verbTranslation.count({
    where: { language_id: language.id }
  });

  stats.totalVerbs = totalCount;
  logger.info(`Found ${totalCount} verbs to process`);

  if (totalCount === 0) {
    logger.warning('No verbs found');
    return stats;
  }

  const batchSize = MIGRATION_CONFIG.batchSize;
  const totalBatches = Math.ceil(totalCount / batchSize);

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const skip = batchNum * batchSize;

    logger.debug(`Processing batch ${batchNum + 1}/${totalBatches}`);

    const verbs = await prisma.verbTranslation.findMany({
      where: { language_id: language.id },
      include: {
        concept: true,
        conjugations: {
          include: {
            tense: true,
            pronoun: true
          },
          take: 10
        }
      },
      orderBy: { id: 'asc' },
      skip,
      take: batchSize
    });

    // Prepare for Gemini
    const verbData = verbs.map((v: any) => ({
      id: v.id,
      word: v.word,
      languageCode: language.iso_code,
      languageName: language.name,
      conjugationCount: v.conjugations.length,
      conceptName: v.concept?.concept_name,
      sampleConjugations: v.conjugations.slice(0, 3).map((c: any) => ({
        tense: c.tense?.tense_name || 'Unknown',
        mood: c.tense?.mood || 'Indicative',
        form: c.display_form
      }))
    }));

    // Get Gemini classifications
    let llmAnalyses: Map<number, any> | null = null;
    if (MIGRATION_CONFIG.useLLM && process.env.GEMINI_API_KEY) {
      try {
        llmAnalyses = await geminiClassifier.classifyBatch(verbData);
      } catch (error) {
        logger.warning(`Gemini batch failed, using rules`);
      }
    }

    // Process each verb
    for (let i = 0; i < verbs.length; i++) {
      const verb = verbs[i];
      const currentIndex = skip + i + 1;
      const llmAnalysis = llmAnalyses?.get(verb.id);

      try {
        if (llmAnalysis) {
          await migrateVerbWithLLM(verb, language, llmAnalysis);
          stats.llmClassified++;
          stats.migrated++;
        } else if (MIGRATION_CONFIG.fallbackToRules) {
          await migrateVerbWithRules(verb, language);
          stats.ruleClassified++;
          stats.migrated++;
        } else {
          stats.failed++;
          stats.errors.push({
            verb: verb.word,
            error: 'LLM failed and fallback disabled'
          });
        }

        logger.progress(currentIndex, totalCount, verb.word);

      } catch (error) {
        stats.failed++;
        stats.errors.push({
          verb: verb.word,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Rate limiting
    if (batchNum < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  logger.success(`Completed ${language.name}`);
  return stats;
}

async function migrateVerbWithLLM(verb: any, language: any, analysis: any) {
  // @ts-ignore - Prisma client type issue
  const existing = await prisma.contentItem.findFirst({
    where: {
      languageId: language.id,
      contentType: 'verb',
      // @ts-ignore - Prisma client type issue
      data: { path: ['verbTranslationId'], equals: verb.id }
    }
  });

  if (existing) return;

  const availableTenses = Array.from(new Set(verb.conjugations.map((c: any) => c.tense?.tense_name).filter(Boolean)));
  const availableMoods = Array.from(new Set(verb.conjugations.map((c: any) => c.tense?.mood).filter(Boolean)));

  if (!MIGRATION_CONFIG.dryRun) {
    // @ts-ignore - Prisma client type issue
    await prisma.contentItem.create({
      data: {
        languageId: language.id,
        contentType: 'verb',
        data: {
          verbTranslationId: verb.id,
          infinitive: verb.word,
          conceptName: verb.concept?.concept_name,
          conjugationCount: verb.conjugations.length,
          availableTenses: availableTenses as any,
          availableMoods: availableMoods as any,
        },
        metadata: {
          difficulty: analysis.difficulty,
          tags: analysis.tags,
          isIrregular: analysis.isIrregular,
          cefrLevel: analysis.cefrLevel,
          frequency: analysis.frequency,
          usageNotes: analysis.usageNotes,
          learnerChallenges: analysis.learnerChallenges,
          hasConjugations: verb.conjugations.length > 0,
          totalForms: verb.conjugations.length,
          tensesCount: availableTenses.length,
          classificationSource: 'gemini',
          migratedAt: new Date().toISOString(),
        }
      }
    });
  }
}

async function migrateVerbWithRules(verb: any, language: any) {
  // @ts-ignore - Prisma client type issue
  const existing = await prisma.contentItem.findFirst({
    where: {
      languageId: language.id,
      contentType: 'verb',
      // @ts-ignore - Prisma client type issue
      data: { path: ['verbTranslationId'], equals: verb.id }
    }
  });

  if (existing) return;

  const difficulty = estimateDifficulty(
    { word: verb.word, conjugations: verb.conjugations },
    language.iso_code as 'es' | 'en' | 'fr'
  );

  const tags = classifyVerb(
    { word: verb.word, conjugations: verb.conjugations },
    language.iso_code as 'es' | 'en' | 'fr'
  );

  const availableTenses = Array.from(new Set(verb.conjugations.map((c: any) => c.tense?.tense_name).filter(Boolean)));
  const availableMoods = Array.from(new Set(verb.conjugations.map((c: any) => c.tense?.mood).filter(Boolean)));

  if (!MIGRATION_CONFIG.dryRun) {
    // @ts-ignore - Prisma client type issue
    await prisma.contentItem.create({
      data: {
        languageId: language.id,
        contentType: 'verb',
        data: {
          verbTranslationId: verb.id,
          infinitive: verb.word,
          conceptName: verb.concept?.concept_name,
          conjugationCount: verb.conjugations.length,
          availableTenses: availableTenses as any,
          availableMoods: availableMoods as any,
        },
        metadata: {
          difficulty,
          tags,
          isIrregular: tags.includes('irregular'),
          hasConjugations: verb.conjugations.length > 0,
          totalForms: verb.conjugations.length,
          tensesCount: availableTenses.length,
          classificationSource: 'rules',
          migratedAt: new Date().toISOString(),
        }
      }
    });
  }
}

main()
  .then(() => {
    logger.success('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
