
import { prisma } from '@/utils/prismaDB';

export interface GenerateDrillsOptions {
  supportedLanguages?: string[];
  skipLiterary?: boolean;
  dryRun?: boolean;
}

const DEFAULT_OPTIONS: GenerateDrillsOptions = {
  skipLiterary: true,
  dryRun: false,
};

export async function generateDrillsForVerb(
  contentItem: any,
  language: any,
  options: GenerateDrillsOptions = {}
): Promise<number> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Handle contentItem.data structure safely
  const data = contentItem.data as any || {};
  const verbTranslationId = contentItem.verbTranslationId || data.verbTranslationId;
  const infinitive = data.infinitive || (contentItem.verbTranslation?.word); // Fallback if data.infinitive missing?

  if (!verbTranslationId) {
    console.warn(`[DrillGen] Missing verbTranslationId for ContentItem ${contentItem.id}`);
    return 0;
  }

  // Get all conjugations for this verb
  const conjugations = await prisma.conjugation.findMany({
    where: {
      verb_translation_id: verbTranslationId,
      ...(opts.skipLiterary && {
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

    // Ensure infinitive is available
    const verbInfinitive = infinitive || await getVerbInfinitive(verbTranslationId);

    // Create DrillItem
    if (!opts.dryRun) {
      await prisma.drillItem.create({
        data: {
          contentItemId: contentItem.id,
          drillType: 'conjugation',
          promptTemplate: {
            conjugationId: conjugation.id,
            tenseId: conjugation.tense_id,
            pronounId: conjugation.pronoun_id,
            infinitive: verbInfinitive,
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

// Helper to get verb word if not present in contentItem data
async function getVerbInfinitive(verbTranslationId: number): Promise<string> {
  const vt = await prisma.verbTranslation.findUnique({
    where: { id: verbTranslationId },
    select: { word: true }
  });
  return vt?.word || 'unknown';
}

export function getNormalizationMode(languageCode: string): string {
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

export function calculateDrillDifficulty(tense: any, languageCode: string): number {
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
  // Handle localized tense names or fallback
  // The DB stores mapped names like "Simple Present", but the difficulty map uses "Present".
  // This might be a mismatch in the original script too.
  // For now I'll use exact match or default 3.
  const name = tense.tense_name;
  if (map[name]) return map[name];

  // Try partial match for keys
  const key = Object.keys(map).find(k => name.includes(k));
  return key ? map[key] : 3;
}

export function generateSkillTags(
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
