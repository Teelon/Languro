
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const drillCount = await prisma.drillItem.count();
    console.log('DrillItem count:', drillCount);

    if (drillCount === 0) {
      // Check content items
      const contentCount = await prisma.contentItem.count();
      console.log('ContentItem count:', contentCount);

      // Check verbs
      const verbCount = await prisma.verbTranslation.count();
      console.log('VerbTranslation count:', verbCount);
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
