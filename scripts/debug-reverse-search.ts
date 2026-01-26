
import { findConjugatedVerb, findConjugatedVerbFuzzyCandidates } from '../src/features/conjugator/services/db';
import { prisma } from '../src/utils/prismaDB';
import * as dotenv from 'dotenv';
dotenv.config();

async function debugSearch() {
  console.log('🔍 Debugging Reverse Search Logic...\n');

  // Test 1: Exact Reverse Lookup for "manejo"
  console.log('--- Test 1: Exact Reverse Lookup for "manejo" (es) ---');
  const exact = await findConjugatedVerb('manejo', 'es');
  console.log('Result:', exact);

  // Debug: Run the raw SQL to see what's happening
  console.log('\n--- Debug: Raw SQL Check for "manejo" ---');
  // We'll mimic the query used in db.ts
  try {
    const rawResults = await prisma.$queryRaw`
      WITH conjugated_forms AS (
          SELECT 
            c.metadata->>'infinitive' as infinitive,
            l.iso_code,
            jsonb_array_elements(c.metadata->'tenses') -> 'conjugations' as conjugations
          FROM "content_items" c
          JOIN "languages" l ON c."languageId" = l.id
          WHERE c."contentType" = 'VERB'
            AND l.iso_code = 'es'
        ),
        forms_expanded AS (
          SELECT 
            infinitive,
            iso_code,
            value->>'displayForm' as display_form
          FROM conjugated_forms,
          jsonb_array_elements(conjugations)
        )
        SELECT 
            infinitive,
            iso_code,
            display_form
        FROM forms_expanded
        WHERE lower(display_form) = 'manejo'
        LIMIT 5
    `;
    console.log('Raw SQL Results:', rawResults);
  } catch (e) {
    console.error('SQL Error:', e);
  }

  // Test 2: Fuzzy Conjugated Lookup for "manejo"
  console.log('\n--- Test 2: Fuzzy Conjugated Lookup for "manejo" (es) ---');
  const fuzzy = await findConjugatedVerbFuzzyCandidates('manejo', 'es', 0.4, 5);
  console.log('Result:', fuzzy);

  // Test 3: Check "manager" in Spanish (to understand why it's not found as suggestion)
  console.log('\n--- Test 3: Fuzzy Lookup for "manager" (es) ---');
  const managerFuzzy = await findConjugatedVerbFuzzyCandidates('manager', 'es', 0.4, 5);
  console.log('Result:', managerFuzzy);
}

debugSearch()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
