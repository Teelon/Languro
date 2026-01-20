const VERBS = {
  spanish: [
    'ser', 'haber', 'estar', 'tener', 'hacer', 'ir', 'poder', 'decir', 'ver', 'dar',
    'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'saber', 'creer', 'hablar',
    'llevar', 'salir', 'volver', 'tomar', 'conocer', 'pedir', 'sentir', 'tratar', 'seguir', 'vivir',
    'leer', 'entender', 'escribir', 'venir', 'pensar', 'empezar', 'trabajar', 'contar', 'dejar', 'esperar',
    'entrar', 'buscar', 'morir', 'gustar', 'jugar', 'mostrar', 'sentar', 'terminar', 'cambiar', 'explicar',
    'necesitar', 'coger', 'preguntar', 'comer', 'sonreír', 'andar', 'correr', 'dormir', 'ayudar', 'estudiar',
    'caer', 'escuchar', 'pagar', 'temer', 'resultar', 'acabar', 'recordar', 'ocurrir', 'aceptar', 'regresar',
    'tirar', 'mover', 'probar', 'producir', 'decidir', 'considerar', 'intentar', 'presentar', 'mantener', 'realizar',
    'comenzar', 'comprender', 'reconocer', 'lograr', 'costar', 'aprender', 'enseñar', 'recibir', 'definir', 'atender',
    'permitir', 'suponer', 'significar', 'existir', 'expresar', 'notar', 'contener', 'aparecer', 'olvidar', 'tratar'
  ],
  english: [
    'be', 'have', 'do', 'say', 'go', 'get', 'make', 'see', 'know', 'think',
    'take', 'come', 'want', 'look', 'use', 'find', 'give', 'tell', 'ask', 'work',
    'seem', 'feel', 'try', 'leave', 'call', 'keep', 'let', 'become', 'put', 'mean',
    'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet',
    'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop',
    'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win',
    'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send',
    'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise',
    'pass', 'sell', 'require', 'report', 'decide', 'pull', 'develop', 'carry', 'break', 'receive',
    'agree', 'support', 'hit', 'produce', 'eat', 'cover', 'catch', 'draw', 'choose', 'cause'
  ],
  french: [
    'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir', 'vouloir', 'venir',
    'devoir', 'mettre', 'prendre', 'falloir', 'donner', 'parler', 'aimer', 'passer', 'trouver', 'croire',
    'tenir', 'rester', 'devenir', 'montrer', 'partir', 'sortir', 'entendre', 'servir', 'attendre', 'vivre',
    'connaître', 'retourner', 'écrire', 'remplir', 'appeler', 'comprendre', 'finir', 'recevoir', 'mourir', 'manger',
    'commencer', 'suivre', 'porter', 'jouer', 'construire', 'tomber', 'sentir', 'rire', 'regarder', 'monter',
    'marcher', 'entrer', 'gagner', 'ouvrir', 'répondre', 'écouter', 'perdre', 'laisser', 'apprendre', 'revenir',
    'penser', 'compter', 'devenir', 'travailler', 'sembler', 'manquer', 'supposer', 'agir', 'noter', 'exister',
    'considérer', 'sembler', 'reconnaître', 'demander', 'sembler', 'décider', 'sembler', 'sembler', 'sembler', 'sembler',
    'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler',
    'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler', 'sembler'
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
