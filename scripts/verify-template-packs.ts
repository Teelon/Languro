
import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';
import { MigrationLogger } from './utils/logger';

const logger = new MigrationLogger();

async function main() {
  logger.header('VERIFYING TEMPLATE PACKS');

  const packs = await prisma.templatePack.findMany({
    include: {
      language: true,
      items: {
        include: {
          contentItem: true
        },
        orderBy: {
          sortOrder: 'asc'
        },
        take: 5 // Get first 5 for sample
      },
      _count: {
        select: { items: true }
      }
    },
    orderBy: [
      { languageId: 'asc' },
      { sortOrder: 'asc' }
    ]
  });

  logger.info(`Found ${packs.length} template packs:\n`);

  for (const pack of packs) {
    console.log(`📦 ${pack.name}`);
    console.log(`   Language: ${pack.language.name} (${pack.language.iso_code})`);
    console.log(`   Level: ${pack.cefrLevel}`);
    console.log(`   Category: ${pack.category}`);
    console.log(`   Verbs: ${pack._count.items}`);
    console.log(`   Public: ${pack.isPublic ? 'Yes' : 'No'}`);
    console.log('');

    if (pack.items.length > 0) {
      console.log(`   Sample verbs from "${pack.name}":`);
      pack.items.forEach((item, index) => {
        const data = item.contentItem.data as any;
        console.log(`     ${index + 1}. ${data.infinitive || 'Unknown'}`);
      });
    } else {
      console.log('   (No items in this pack)');
    }
    console.log('\n   ' + '-'.repeat(40) + '\n');
  }

  logger.success('Verification complete.');
}

main()
  .catch((error) => {
    logger.error(`Verification failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
