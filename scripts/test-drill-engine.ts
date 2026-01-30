import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';

/**
 * 🧪 Testing Drill Engine
 * 
 * NOTE: This script calls API endpoints that require authentication.
 * For this to work in a real environment, you'd need to provide a valid session cookie.
 * However, we can also test the lib functions directly below.
 */
async function testDrillEngine() {
  console.log('🧪 Testing Drill Engine\n');

  // Debug DB state
  const tenses = await prisma.tense.count();
  const conjugations = await prisma.conjugation.count();
  const contentItems = await prisma.contentItem.count({ where: { contentType: 'verb' } });
  const drillItems = await prisma.drillItem.count();

  console.log(`DB State:
    Tenses: ${tenses}
    Conjugations: ${conjugations}
    Verb ContentItems: ${contentItems}
    DrillItems: ${drillItems}
  `);

  if (contentItems > 0) {
    const verb = await prisma.contentItem.findFirst({ where: { contentType: 'verb' } });
    const data = verb?.data as any;
    console.log('Sample Verb ID:', verb?.id);
    console.log('Sample Verb Data:', JSON.stringify(data));

    const vId = data?.verbTranslationId;
    console.log('Extracted verbTranslationId:', vId);

    if (vId) {
      const count = await prisma.conjugation.count({ where: { verb_translation_id: vId } });
      console.log(`Conjugations found for ID ${vId}: ${count}`);

      if (count > 0) {
        // Try to find conjugations via list
        const conjugations = await prisma.conjugation.findMany({
          where: { verb_translation_id: vId },
          take: 5
        });
        console.log('Sample Conjugation:', JSON.stringify(conjugations[0]));
      }
    }
  }

  if (conjugations === 0) {
    console.warn('⚠️ No conjugations found! Drills cannot be generated.');
  }

  // 1. Get any user or create one
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('Creates test user...');
    user = await prisma.user.create({
      data: {
        email: 'test-drill-user@example.com',
        name: 'Drill Tester',
      }
    });
  }
  const testUserId = user.id;
  console.log(`✓ Using user: ${user.email} (${user.id})`);

  // 2. Get verification list
  let userList = await prisma.userList.findFirst({
    where: {
      userId: testUserId,
      name: 'Drill Verification List'
    },
    include: {
      _count: { select: { items: true } }
    }
  });

  if (!userList) {
    console.log('Creating verification list...');
    // Use English
    const language = await prisma.language.findFirst({
      where: { iso_code: 'en' }
    });

    if (!language) {
      throw new Error("No English language found.");
    }

    userList = await prisma.userList.create({
      data: {
        userId: testUserId,
        name: 'Drill Verification List',
        languageId: language.id
      },
      include: {
        _count: { select: { items: true } }
      }
    });
  }

  // 3. Ensure list has items
  if (userList._count.items === 0) {
    console.log('List is empty. Adding a verb...');
    // Find a verb content item that is English
    const verb = await prisma.contentItem.findFirst({
      where: {
        contentType: 'verb',
        language: { iso_code: 'en' }
      }
    });

    if (!verb) {
      console.error('❌ No English verb content items found.');
      return;
    }

    await prisma.userListItem.create({
      data: {
        listId: userList.id,
        contentItemId: verb.id
      }
    });
    console.log(`✓ Added verb content item ${verb.id} to list.`);

    // Refresh list count
    userList._count.items = 1;
  }

  console.log(`✓ Found list: "${userList.name}" (ID: ${userList.id}) with ${userList._count.items} verbs\n`);

  /*
  // API testing would look like this, but needs a Cookie header
  console.log('1️⃣  Testing session builder API...');
  const sessionRes = await fetch('http://localhost:3000/api/drill/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Cookie': 'next-auth.session-token=...'
    },
    body: JSON.stringify({
      listId: userList.id,
      count: 5
    })
  });
  */

  // Since API requires auth, let's test the library functions directly
  console.log('1️⃣  Testing session builder library function...');
  const { buildDrillSession, getSessionStats } = await import('../src/lib/drill/session-builder');

  const prompts = await buildDrillSession({
    userId: testUserId,
    listId: userList.id,
    count: 5
  });

  console.log('   prompts.length:', prompts.length);
  if (prompts.length > 0) {
    console.log('   ✓ Session created with prompts');
    const first = prompts[0];
    console.log(`     Verb: ${first.infinitive}`);
    console.log(`     Tense: ${first.tenseName}`);
    console.log(`     Pronoun: ${first.pronounLabel}`);

    // Test stats
    const stats = await getSessionStats(testUserId, userList.id);
    console.log(`   ✓ Stats - Total drills in list: ${stats.totalDrills}`);

    console.log('\n2️⃣  Testing validation and attempt recording logic...');
    const { validateDrillAnswer } = await import('../src/lib/drill/validation');

    const drillItemId = prompts[0].drillItemId;
    // We'll just run the validation part to see if it works
    const validation = await validateDrillAnswer(drillItemId, 'testing');
    console.log('   Validation result:', validation.isCorrect ? 'Correct (unexpected for "testing")' : 'Incorrect (expected)');
    console.log('   Error Classification:', validation.errorType);

  } else {
    console.log('   ✗ No prompts generated. Ensure your list has verbs with generated drills.');
  }

  console.log('\n✅ Drill engine core tests complete!');
}

testDrillEngine()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
