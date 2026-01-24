import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { computeNextReviewAt } from '../src/lib/drill/srs';

/**
 * 🧪 Test SRS Logic (Phase 5)
 */
async function testSRS() {
  console.log('🧪 Testing SRS Integration\n');

  // Test User
  const testUserId = 'cmkbuzjdh0000zw7vpgtix8s4'; // From previous discovery

  // 1. Get a Drill Item
  const drillItem = await prisma.drillItem.findFirst();
  if (!drillItem) {
    console.error('❌ No drill items found.');
    return;
  }
  console.log(`✓ Using drill item: ${drillItem.id}`);

  // 2. Clear existing mastery for this item
  await prisma.mastery.deleteMany({
    where: { userId: testUserId, drillItemId: drillItem.id }
  });
  console.log('✓ Cleared previous mastery');

  // 3. Simulate Attempt 1: Incorrect
  const now = new Date();

  // NOTE: We are simulating the logic that's inside /api/drill/submit
  // Since we can't easily curl the API with auth here, we replicate the transaction logic
  // to verify it behaves as expected at the database level.

  console.log('\n--- Attempt 1: Incorrect ---');
  await submitSimulatedAttempt(testUserId, drillItem.id, false, 0);

  let mastery = await prisma.mastery.findUnique({
    where: { userId_drillItemId: { userId: testUserId, drillItemId: drillItem.id } }
  });

  if (mastery) {
    console.log(`   Score: ${mastery.score} (Expected: 0)`);
    console.log(`   Streak: ${mastery.correctStreak} (Expected: 0)`);

    // Check nextReviewAt (should be roughly 10 mins from now)
    const diffMins = (mastery.nextReviewAt!.getTime() - now.getTime()) / 60000;
    console.log(`   Next Review: in ${diffMins.toFixed(1)} mins (Expected: ~10.0)`);
  }

  // 4. Simulate Attempt 2: Correct (Streak 1)
  console.log('\n--- Attempt 2: Correct ---');
  await submitSimulatedAttempt(testUserId, drillItem.id, true, mastery?.correctStreak || 0, mastery?.score || 0);

  mastery = await prisma.mastery.findUnique({
    where: { userId_drillItemId: { userId: testUserId, drillItemId: drillItem.id } }
  });

  if (mastery) {
    console.log(`   Score: ${mastery.score} (Expected: 0.1)`);
    console.log(`   Streak: ${mastery.correctStreak} (Expected: 1)`);

    const diffHours = (mastery.nextReviewAt!.getTime() - now.getTime()) / (60000 * 60);
    console.log(`   Next Review: in ${diffHours.toFixed(1)} hours (Expected: ~24.0)`);
  }

  // 5. Simulate Attempt 3: Correct (Streak 2)
  console.log('\n--- Attempt 3: Correct ---');
  await submitSimulatedAttempt(testUserId, drillItem.id, true, mastery?.correctStreak || 0, mastery?.score || 0);

  mastery = await prisma.mastery.findUnique({
    where: { userId_drillItemId: { userId: testUserId, drillItemId: drillItem.id } }
  });

  if (mastery) {
    console.log(`   Score: ${mastery.score}`);
    console.log(`   Streak: ${mastery.correctStreak} (Expected: 2)`);

    const diffDays = (mastery.nextReviewAt!.getTime() - now.getTime()) / (60000 * 60 * 24);
    console.log(`   Next Review: in ${diffDays.toFixed(1)} days (Expected: ~3.0)`);
  }

  console.log('\n✅ SRS tests complete!');
}

async function submitSimulatedAttempt(
  userId: string,
  drillItemId: string,
  isCorrect: boolean,
  prevStreak: number,
  prevScore: number = 0
) {
  const now = new Date();

  const nextStreak = isCorrect ? prevStreak + 1 : 0;
  let nextScore = isCorrect ? prevScore + 0.1 : prevScore - 0.2;
  nextScore = Math.max(0, Math.min(1, nextScore));

  const nextReviewAt = computeNextReviewAt(now, isCorrect, nextStreak);

  await prisma.mastery.upsert({
    where: { userId_drillItemId: { userId, drillItemId } },
    create: {
      userId,
      drillItemId,
      score: nextScore,
      correctStreak: nextStreak,
      seenCount: 1,
      lastAttemptAt: now,
      nextReviewAt,
    },
    update: {
      score: nextScore,
      correctStreak: nextStreak,
      seenCount: { increment: 1 },
      lastAttemptAt: now,
      nextReviewAt,
    },
  });
}

testSRS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
