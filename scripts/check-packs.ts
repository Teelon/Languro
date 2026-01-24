
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const packs = await prisma.templatePack.count();
    console.log('TemplatePack count:', packs);

    if (packs === 0) {
      console.log('NO TEMPLATE PACKS FOUND!');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
