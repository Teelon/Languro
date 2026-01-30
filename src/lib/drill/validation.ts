
import { prisma } from '@/utils/prismaDB';

export interface ValidationResult {
  isCorrect: boolean;
  errorType?: string;
  errorDetails?: {
    expected: string;
    received: string;
    normalizedExpected: string;
    normalizedReceived: string;
    levenshteinDistance?: number;
    languageCode?: string;
  };
}

/**
 * Validate a drill answer
 */
export async function validateDrillAnswer(
  drillItemId: string,
  userInput: string
): Promise<ValidationResult> {
  // Fetch drill item with all necessary data
  const drillItem = await prisma.drillItem.findUnique({
    where: { id: drillItemId },
    include: {
      contentItem: {
        include: {
          language: true
        }
      }
    }
  });

  if (!drillItem) {
    throw new Error('DrillItem not found');
  }

  const validationRule = drillItem.validationRule as any;
  const expectedForm = validationRule.expectedForm;
  const normalizationMode = validationRule.normalization;
  const languageCode = drillItem.contentItem.language.iso_code;

  // Normalize both inputs
  const normalizedInput = normalize(userInput, normalizationMode);
  const normalizedExpected = normalize(expectedForm, normalizationMode);

  // Check if correct
  const isCorrect = normalizedInput === normalizedExpected;

  if (isCorrect) {
    return { isCorrect: true };
  }

  // Classify the error
  const errorType = await classifyError(
    userInput,
    expectedForm,
    languageCode,
    drillItem
  );

  return {
    isCorrect: false,
    errorType,
    errorDetails: {
      expected: expectedForm,
      received: userInput,
      normalizedExpected,
      normalizedReceived: normalizedInput,
      levenshteinDistance: levenshtein(userInput, expectedForm),
      languageCode
    }
  };
}

/**
 * Normalize text based on mode
 */
function normalize(text: string, mode: string): string {
  let normalized = text.toLowerCase().trim();

  if (mode === 'lenient_accents') {
    // Remove diacritics (accents)
    normalized = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Classify the type of error
 */
async function classifyError(
  userInput: string,
  expected: string,
  languageCode: string,
  drillItem: any
): Promise<string> {
  const userNorm = normalize(userInput, 'lenient_accents');
  const expectedNorm = normalize(expected, 'lenient_accents');

  // 1. Diacritic error (only for languages with accents)
  if (['es', 'fr'].includes(languageCode)) {
    if (userNorm === expectedNorm) {
      return 'DIACRITIC_ONLY';
    }
  }

  // 2. Check if it's a different form of the same verb
  const promptTemplate = drillItem.promptTemplate as any;
  const conjugationId = promptTemplate.conjugationId;
  const verbTranslationId = drillItem.contentItem.verbTranslationId || (drillItem.contentItem.data as any)?.verbTranslationId;

  if (!verbTranslationId) {
    return 'OTHER';
  }

  // Get all other forms of this verb
  const otherForms = await prisma.conjugation.findMany({
    where: {
      verb_translation_id: verbTranslationId,
      id: { not: conjugationId }
    },
    include: {
      tense: true,
      pronoun: true
    }
  });

  // Check if user typed another valid form
  for (const form of otherForms) {
    const formNorm = normalize(form.display_form, 'lenient_accents');
    if (formNorm === userNorm) {
      // It's another valid form - determine what they got wrong
      if (form.tense_id !== promptTemplate.tenseId) {
        return 'WRONG_TENSE';
      }
      if (form.pronoun_id !== promptTemplate.pronounId) {
        return 'WRONG_PERSON';
      }
    }
  }

  // 3. Spelling close (Levenshtein distance <= 2)
  const distance = levenshtein(userInput, expected);
  if (distance <= 2) {
    return 'SPELLING_CLOSE';
  }

  // 4. Completely wrong
  return 'OTHER';
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
