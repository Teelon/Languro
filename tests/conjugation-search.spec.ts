import { test, expect, Page } from '@playwright/test';

/**
 * Conjugation Search QA Test Suite
 * 
 * This test suite verifies conjugation search functionality by:
 * 1. Searching for various verbs in different languages
 * 2. Verifying that expected verbs are found
 * 3. Testing fuzzy matching scenarios
 * 4. Testing cross-language confusion scenarios
 */

const BASE_URL = 'http://localhost:3000';

interface SearchTestCase {
  name: string;
  input: string;
  language: 'en' | 'fr' | 'es';
  expectedInfinitive?: string;
  shouldFind: boolean;
  expectSuggestions?: boolean;
  notes?: string;
}

const TEST_CASES: SearchTestCase[] = [
  // Spanish verbs - Exact matches
  {
    name: 'Spanish: manajar (exact)',
    input: 'manajar',
    language: 'es',
    expectedInfinitive: 'manajar',
    shouldFind: true,
    notes: 'User reported this verb is not being found'
  },
  {
    name: 'Spanish: comer (exact)',
    input: 'comer',
    language: 'es',
    expectedInfinitive: 'comer',
    shouldFind: true
  },
  {
    name: 'Spanish: hablar (exact)',
    input: 'hablar',
    language: 'es',
    expectedInfinitive: 'hablar',
    shouldFind: true
  },
  {
    name: 'Spanish: trabajar (exact)',
    input: 'trabajar',
    language: 'es',
    expectedInfinitive: 'trabajar',
    shouldFind: true
  },

  // Typos and fuzzy matching
  {
    name: 'Spanish: managear (typo → should suggest manajar)',
    input: 'managear',
    language: 'es',
    shouldFind: false,
    expectSuggestions: true,
    notes: 'Should suggest "manajar" via fuzzy matching'
  },
  {
    name: 'Spanish: come (short form)',
    input: 'come',
    language: 'es',
    shouldFind: true, // Could find as conjugated form
    notes: 'Conjugated form of comer - should reverse lookup'
  },

  // Cross-language confusion tests
  {
    name: 'Spanish language with French verb',
    input: 'manger',
    language: 'es',
    shouldFind: false,
    expectSuggestions: false,
    notes: 'Should NOT find French verb when Spanish is selected'
  },
  {
    name: 'Spanish language with English-looking verb',
    input: 'manager',
    language: 'es',
    shouldFind: false,
    expectSuggestions: true,
    notes: 'Might suggest "manajar" if fuzzy matching works'
  },

  // French verbs
  {
    name: 'French: manger (exact)',
    input: 'manger',
    language: 'fr',
    expectedInfinitive: 'manger',
    shouldFind: true
  },
  {
    name: 'French: travailler (exact)',
    input: 'travailler',
    language: 'fr',
    expectedInfinitive: 'travailler',
    shouldFind: true
  },

  // English verbs
  {
    name: 'English: work (exact)',
    input: 'work',
    language: 'en',
    expectedInfinitive: 'work',
    shouldFind: true
  },
  {
    name: 'English: to work (with "to")',
    input: 'to work',
    language: 'en',
    expectedInfinitive: 'work',
    shouldFind: true,
    notes: 'Should strip "to" prefix'
  },
];

async function searchForVerb(page: Page, verb: string, language: 'en' | 'fr' | 'es') {
  // Select language
  await page.selectOption('select[aria-label="Language selection"]', language);

  // Type verb
  await page.fill('input[placeholder*="comer"]', verb);

  // Click conjugate button
  await page.click('button:has-text("Conjugate")');

  // Wait for either results or error/suggestions
  await page.waitForTimeout(2000); // Give time for API call
}

async function getSearchResult(page: Page) {
  // Check for various states
  const errorDiv = page.locator('div.bg-red-50, div.bg-red-900\\/20');
  const notificationDiv = page.locator('div.bg-blue-50, div.bg-blue-900\\/20');
  const suggestionsDiv = page.locator('p:has-text("Did you mean:")');
  const resultsTable = page.locator('[data-testid="conjugation-results"], table, .conjugation-section');

  const hasError = await errorDiv.isVisible().catch(() => false);
  const hasNotification = await notificationDiv.isVisible().catch(() => false);
  const hasSuggestions = await suggestionsDiv.isVisible().catch(() => false);
  const hasResults = await resultsTable.isVisible().catch(() => false);

  let errorText = '';
  let notificationText = '';
  let suggestions: string[] = [];

  if (hasError) {
    errorText = await errorDiv.textContent() || '';
  }

  if (hasNotification) {
    notificationText = await notificationDiv.textContent() || '';
  }

  if (hasSuggestions) {
    const suggestionButtons = page.locator('button:near(p:has-text("Did you mean:"))');
    const count = await suggestionButtons.count();
    for (let i = 0; i < count; i++) {
      const text = await suggestionButtons.nth(i).textContent();
      if (text) suggestions.push(text.trim());
    }
  }

  return {
    found: hasResults,
    hasError,
    hasNotification,
    hasSuggestions,
    errorText,
    notificationText,
    suggestions
  };
}

test.describe('Conjugation Search QA Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the conjugator page
    await page.goto(`${BASE_URL}/conjugator`);
    await page.waitForLoadState('networkidle');
  });

  for (const testCase of TEST_CASES) {
    test(testCase.name, async ({ page }) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TEST: ${testCase.name}`);
      console.log(`Input: "${testCase.input}", Language: ${testCase.language}`);
      if (testCase.notes) {
        console.log(`Notes: ${testCase.notes}`);
      }
      console.log('='.repeat(60));

      // Perform search
      await searchForVerb(page, testCase.input, testCase.language);

      // Get results
      const result = await getSearchResult(page);

      // Log results
      console.log(`\nResults:`);
      console.log(`  Found: ${result.found}`);
      console.log(`  Has Error: ${result.hasError}`);
      console.log(`  Has Suggestions: ${result.hasSuggestions}`);
      if (result.errorText) {
        console.log(`  Error: ${result.errorText}`);
      }
      if (result.notificationText) {
        console.log(`  Notification: ${result.notificationText}`);
      }
      if (result.suggestions.length > 0) {
        console.log(`  Suggestions: ${result.suggestions.join(', ')}`);
      }

      // Assert expected behavior
      if (testCase.shouldFind) {
        expect(result.found, `Expected to find "${testCase.input}"`).toBe(true);
      } else {
        expect(result.found, `Expected NOT to find "${testCase.input}"`).toBe(false);
      }

      if (testCase.expectSuggestions !== undefined) {
        expect(result.hasSuggestions,
          `Expected ${testCase.expectSuggestions ? 'to have' : 'NOT to have'} suggestions for "${testCase.input}"`
        ).toBe(testCase.expectSuggestions);
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/search-${testCase.language}-${testCase.input.replace(/\s+/g, '_')}.png`,
        fullPage: true
      });

      console.log(`✅ Test passed\n`);
    });
  }
});

// Summary test to run all searches and create a report
test('Search Summary Report', async ({ page }) => {
  await page.goto(`${BASE_URL}/conjugator`);

  const results: Array<{
    testCase: SearchTestCase;
    result: Awaited<ReturnType<typeof getSearchResult>>;
    passed: boolean;
  }> = [];

  for (const testCase of TEST_CASES) {
    await searchForVerb(page, testCase.input, testCase.language);
    const result = await getSearchResult(page);

    const passed = testCase.shouldFind === result.found;

    results.push({ testCase, result, passed });

    // Reset for next test
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('SEARCH TEST SUMMARY');
  console.log('='.repeat(80));

  let passedCount = 0;
  let failedCount = 0;

  for (const { testCase, result, passed } of results) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} | ${testCase.name}`);
    console.log(`   Input: "${testCase.input}" (${testCase.language})`);
    console.log(`   Expected: ${testCase.shouldFind ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   Actual: ${result.found ? 'FOUND' : 'NOT FOUND'}`);

    if (result.suggestions.length > 0) {
      console.log(`   Suggestions: ${result.suggestions.join(', ')}`);
    }

    if (passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passedCount} (${((passedCount / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedCount} (${((failedCount / results.length) * 100).toFixed(1)}%)`);
  console.log('='.repeat(80) + '\n');

  // Fail the test if any failed
  expect(failedCount, 'Some tests failed').toBe(0);
});
