
import 'dotenv/config';
import { validateDrillAnswer } from '../lib/drill/validation';
import { prisma } from '../src/utils/prismaDB';

async function main() {
  console.log('🧪 Testing Validation Logic\n');

  // Get a sample drill item
  const drillItem = await prisma.drillItem.findFirst({
    include: {
      contentItem: true
    }
  });

  if (!drillItem) {
    console.error('No drill items found. Run generate:drills first.');
    return;
  }

  const promptTemplate = drillItem.promptTemplate as any;
  const validationRule = drillItem.validationRule as any;
  const expectedAnswer = validationRule.expectedForm;

  console.log('Testing drill item:');
  console.log(`  Verb: ${promptTemplate.infinitive}`);
  console.log(`  Tense: ${promptTemplate.tenseName}`);
  console.log(`  Person: ${promptTemplate.pronounLabel}`);
  console.log(`  Expected: ${expectedAnswer}\n`);

  // Test cases
  const testCases = [
    { input: expectedAnswer, description: 'Correct answer' },
    { input: expectedAnswer.toUpperCase(), description: 'Correct with uppercase' },
    { input: ` ${expectedAnswer} `, description: 'Correct with whitespace' },
  ];

  // Add accent test for Spanish/French
  const languageCode = (drillItem.contentItem as any).language?.iso_code;
  if (['es', 'fr'].includes(languageCode) && expectedAnswer.normalize('NFD').match(/[\u0300-\u036f]/)) {
    const withoutAccent = expectedAnswer
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    testCases.push({
      input: withoutAccent,
      description: 'Missing accent'
    });
  }

  // Add typo test
  if (expectedAnswer.length > 2) {
    const typo = expectedAnswer.slice(0, -1) + 'x';
    testCases.push({
      input: typo,
      description: 'Typo (1 character off)'
    });
  }

  // Add completely wrong test
  testCases.push({
    input: 'zzzzz',
    description: 'Completely wrong'
  });

  // Run tests
  for (const testCase of testCases) {
    const result = await validateDrillAnswer(drillItem.id, testCase.input);

    console.log(`Test: ${testCase.description}`);
    console.log(`  Input: "${testCase.input}"`);
    console.log(`  Result: ${result.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

    if (!result.isCorrect && result.errorType) {
      console.log(`  Error Type: ${result.errorType}`);
      if (result.errorDetails) {
        console.log(`  Levenshtein Distance: ${result.errorDetails.levenshteinDistance}`);
      }
    }
    console.log();
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
