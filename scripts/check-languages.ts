
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const languages = await prisma.language.findMany();
  console.log('Languages:', JSON.stringify(languages, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
