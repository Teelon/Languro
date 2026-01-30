
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const languages = await prisma.language.findMany();
    console.log('Languages:', JSON.stringify(languages, null, 2));
    const tenses = await prisma.tense.count();
    console.log(`Tense count: ${tenses}`);
    const conjugations = await prisma.conjugation.count();
    console.log(`Conjugation count: ${conjugations}`);
    const contentItems = await prisma.contentItem.count();
    console.log(`ContentItem count: ${contentItems}`);
    const drillItems = await prisma.drillItem.count();
    console.log(`DrillItem count: ${drillItems}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
