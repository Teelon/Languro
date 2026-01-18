const VERBS = {
  spanish: [
    'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber',
    'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'creer', 'hablar', 'llevar'
  ],
  english: [
    'to be', 'to have', 'to do', 'to say', 'to get', 'to make', 'to go', 'to know', 'to take', 'to see',
    'to come', 'to think', 'to look', 'to want', 'to give', 'to use', 'to find', 'to tell', 'to ask', 'to work'
  ],
  french: [
    'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir', 'vouloir', 'venir',
    'devoir', 'prendre', 'donner', 'parler', 'aimer', 'passer', 'mettre', 'croire', 'trouver', 'demander'
  ]
};

const BASE_URL = 'http://localhost:3000';
const CONCURRENCY = 5;

// Helper for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seedVerb(verb, language) {
  try {
    console.log(`[${language}] checking: ${verb}...`);
    
    // Step 1: Check
    const checkRes = await fetch(`${BASE_URL}/api/conjugate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verb, language, mode: 'check' })
    });

    if (!checkRes.ok) {
      const text = await checkRes.text();
      throw new Error(`Check failed: ${checkRes.status} - ${text}`);
    }

    const checkData = await checkRes.json();

    if (!checkData.needsGeneration) {
      console.log(`[${language}] SUCCESS: ${verb} (already existed)`);
      return;
    }

    // Step 2: Generate
    console.log(`[${language}] generating: ${verb}...`);
    const genRes = await fetch(`${BASE_URL}/api/conjugate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verb,
        language,
        mode: 'generate',
        context: checkData.context
      })
    });

    if (!genRes.ok) {
        const text = await genRes.text();
        throw new Error(`Generation failed: ${genRes.status} - ${text}`);
    }
    
    console.log(`[${language}] SUCCESS: ${verb} (generated)`);

  } catch (error) {
    console.error(`[${language}] ERROR: ${verb} -`, error.message);
  }
}

async function runValues(list, language) {
    // Process list in chunks of CONCURRENCY
    for (let i = 0; i < list.length; i += CONCURRENCY) {
        const chunk = list.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(verb => seedVerb(verb, language)));
    }
}

async function main() {
  console.log('Starting seed process...');
  
  // We can run languages in sequence to avoid hitting rate limits too hard globally, 
  // or parallelize everything. The user prompt said "start with spanish".
  
  console.log('\n--- Seeding Spanish ---');
  await runValues(VERBS.spanish, 'es');

  console.log('\n--- Seeding English ---');
  await runValues(VERBS.english.map(v => v.replace(/^to /, '')), 'en'); // remove 'to ' for cleaner lookups if needed, or keep it. UI example had "run". Let's try raw first but "to be" is standard citation form.

  console.log('\n--- Seeding French ---');
  await runValues(VERBS.french, 'fr');

  console.log('\nDone!');
}

main();
