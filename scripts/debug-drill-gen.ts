
import 'dotenv/config';
import { prisma } from '../src/utils/prismaDB';

async function main() {
  console.log('Debugging Drill Generation...');

  // Get a verb
  const contentItem = await prisma.contentItem.findFirst({
    where: { contentType: 'verb' }
  });

  if (!contentItem) {
    console.log('No content item found');
    return;
  }

  console.log('Content Item:', JSON.stringify(contentItem, null, 2));

  const data = contentItem.data as any;
  const verbTranslationId = data?.verbTranslationId; // || contentItem.verbTranslationId;

  console.log('Using verbTranslationId:', verbTranslationId);

  if (!verbTranslationId) {
    console.log('No verbTranslationId found in data');
    return;
  }

  // Find conjugations
  const conjugations = await prisma.conjugation.findMany({
    where: {
      verb_translation_id: verbTranslationId
    },
    include: {
      tense: true,
      pronoun: true
    }
  });

  console.log(`Found ${conjugations.length} conjugations`);

  if (conjugations.length > 0) {
    console.log('First conjugation:', JSON.stringify(conjugations[0], null, 2));

    // Check filter
    const skipLiterary = true;
    const filtered = conjugations.filter(c => {
      if (!c.tense) return false;
      if (skipLiterary && c.tense.is_literary) return false;
      return true;
    });
    console.log(`After filtering literary: ${filtered.length}`);

    // Check Tense/Pronoun
    const valid = filtered.filter(c => c.tense && c.pronoun);
    console.log(`After checking tense/pronoun presence: ${valid.length}`);
  }

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
