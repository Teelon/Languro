
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const languages = await prisma.language.findMany();
    console.log('Languages:', JSON.stringify(languages, null, 2));
    const tenses = await prisma.tense.count();
    console.log(`Tense count: ${tenses}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
