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

  // Using found test user ID
  const testUserId = 'cmkbuzjdh0000zw7vpgtix8s4';

  // 1. Get user's first list
  const userList = await prisma.userList.findFirst({
    where: {
      userId: testUserId,
      isActive: true
    },
    include: {
      _count: { select: { items: true } }
    }
  });

  if (!userList) {
    console.error('❌ No active user lists found for this user. Create a list first.');
    return;
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
