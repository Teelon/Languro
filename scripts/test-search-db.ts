import { prisma } from '../src/utils/prismaDB';

interface VerbSearchResult {
  id: string;
  language: string;
  infinitive: string;
  similarity?: number;
}

async function testSearchDatabase() {
  console.log('🔍 Testing Conjugation Search Database...\n');

  // Test 1: Check if "manajar" exists
  console.log('='.repeat(60));
  console.log('TEST 1: Looking for "manajar" in database');
  console.log('='.repeat(60));

  const manajarExact = await prisma.$queryRaw<Array<{ id: string; language: string; infinitive: string }>>`
    SELECT 
      c.id,
      l.iso_code as language,
      c.metadata->>'infinitive' as infinitive
    FROM content_items c
    JOIN languages l ON c."languageId" = l.id
    WHERE c."contentType" = 'VERB'
      AND c.metadata->>'infinitive' = 'manajar'
  `;

  if (manajarExact.length > 0) {
    console.log('✅ FOUND "manajar" in database:');
    manajarExact.forEach(v => {
      console.log(`   - ID: ${v.id}, Language: ${v.language}, Infinitive: ${v.infinitive}`);
    });
  } else {
    console.log('❌ "manajar" NOT FOUND in database');
  }

  // Test 2: Find Spanish verbs starting with "man"
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Spanish verbs starting with "man"');
  console.log('='.repeat(60));

  const manVerbs = await prisma.$queryRaw<VerbSearchResult[]>`
    SELECT 
      c.id,
      l.iso_code as language,
      c.metadata->>'infinitive' as infinitive,
      similarity('manajar', c.metadata->>'infinitive') as similarity
    FROM content_items c
    JOIN languages l ON c."languageId" = l.id
    WHERE c."contentType" = 'VERB'
      AND l.iso_code = 'es'
      AND c.metadata->>'infinitive' LIKE 'man%'
    ORDER BY similarity DESC
    LIMIT 20
  `;

  console.log(`Found ${manVerbs.length} Spanish verbs:`);
  manVerbs.forEach(v => {
    console.log(`   ${v.infinitive} (${v.language}) - similarity: ${v.similarity?.toFixed(3)}`);
  });

  // Test 3: Find similar verbs across all languages
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Fuzzy search for "manajar" across all languages');
  console.log('='.repeat(60));

  const fuzzyResults = await prisma.$queryRaw<VerbSearchResult[]>`
    SELECT 
      c.id,
      l.iso_code as language,
      c.metadata->>'infinitive' as infinitive,
      similarity('manajar', c.metadata->>'infinitive') as similarity
    FROM content_items c
    JOIN languages l ON c."languageId" = l.id
    WHERE c."contentType" = 'VERB'
      AND similarity('manajar', c.metadata->>'infinitive') >= 0.25
    ORDER BY similarity DESC
    LIMIT 20
  `;

  console.log(`Found ${fuzzyResults.length} similar verbs (similarity >= 0.25):`);
  fuzzyResults.forEach(v => {
    console.log(`   ${v.infinitive} (${v.language}) - similarity: ${v.similarity?.toFixed(3)}`);
  });

  // Test 4: Get 20 random Spanish verbs for testing
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Random Spanish verbs for QA testing');
  console.log('='.repeat(60));

  const spanishVerbs = await prisma.$queryRaw<VerbSearchResult[]>`
    SELECT 
      c.id,
      l.iso_code as language,
      c.metadata->>'infinitive' as infinitive
    FROM content_items c
    JOIN languages l ON c."languageId" = l.id
    WHERE c."contentType" = 'VERB'
      AND l.iso_code = 'es'
    ORDER BY RANDOM()
    LIMIT 20
  `;

  console.log(`Random Spanish test verbs:`);
  spanishVerbs.forEach(v => {
    console.log(`   - ${v.infinitive}`);
  });

  // Test 5: Get French and English verbs similar to Spanish ones
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Cross-language confusion test');
  console.log('='.repeat(60));

  const confusionTests = ['manager', 'manger', 'trabajar', 'travailler'];

  for (const word of confusionTests) {
    const results = await prisma.$queryRaw<VerbSearchResult[]>`
      SELECT 
        c.id,
        l.iso_code as language,
        c.metadata->>'infinitive' as infinitive,
        similarity(${word}, c.metadata->>'infinitive') as similarity
      FROM content_items c
      JOIN languages l ON c."languageId" = l.id
      WHERE c."contentType" = 'VERB'
        AND similarity(${word}, c.metadata->>'infinitive') >= 0.40
      ORDER BY similarity DESC
      LIMIT 5
    `;

    console.log(`\nSearching for "${word}":`);
    if (results.length > 0) {
      results.forEach(v => {
        console.log(`   ${v.infinitive} (${v.language}) - similarity: ${v.similarity?.toFixed(3)}`);
      });
    } else {
      console.log(`   No matches found`);
    }
  }

  // Test 6: Check database statistics
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Database statistics');
  console.log('='.repeat(60));

  const stats = await prisma.$queryRaw<Array<{ language: string; count: bigint }>>`
    SELECT 
      l.iso_code as language,
      COUNT(*) as count
    FROM content_items c
    JOIN languages l ON c."languageId" = l.id
    WHERE c."contentType" = 'VERB'
    GROUP BY l.iso_code
    ORDER BY count DESC
  `;

  console.log('Verb counts by language:');
  stats.forEach(s => {
    console.log(`   ${s.language}: ${s.count} verbs`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Database testing complete!');
  console.log('='.repeat(60));
}

testSearchDatabase()
  .catch((e) => {
    console.error('❌ Error during testing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
