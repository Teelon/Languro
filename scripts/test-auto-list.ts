
import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { autoCreateStarterList } from '../src/features/onboarding/services/onboardingService';

async function main() {
  console.log('🧪 Testing Auto-Create Starter List...');

  // 1. Setup: Get a user and a target language
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found in database. Please seed one first.');
    return;
  }

  // Use Spanish 'es' as target
  const targetLangCode = 'es';
  const cefrLevel = 'A1';

  console.log(`👤 User: ${user.id} (${user.email || 'No email'})`);
  console.log(`🎯 Target: ${targetLangCode} ${cefrLevel}`);

  // 2. Clean up any existing list for this test
  await prisma.userList.deleteMany({
    where: {
      userId: user.id,
      language: { iso_code: targetLangCode },
      name: { contains: 'Verbs' }
    }
  });

  // 3. Run the function
  console.log('🔄 Calling autoCreateStarterList...');
  const result = await autoCreateStarterList(user.id, targetLangCode, cefrLevel);

  // 4. Verify
  if (result) {
    console.log('✅ Success! List created/found:');
    console.log(`   ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Description: ${result.description}`);

    // Check items count
    const count = await prisma.userListItem.count({
      where: { listId: result.id }
    });
    console.log(`   Items count: ${count}`);

    if (count > 0) {
      console.log('✅ Items populated correctly.');
    } else {
      console.error('❌ List created but empty!');
    }

  } else {
    console.error('❌ Failed: returned null.');

    // Check if template pack exists
    const lang = await prisma.language.findUnique({ where: { iso_code: targetLangCode } });
    if (lang) {
      const pack = await prisma.templatePack.findFirst({
        where: { languageId: lang.id, cefrLevel: cefrLevel }
      });
      if (!pack) {
        console.error('   Reason: Template pack not found.');
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
