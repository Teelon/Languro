

import fs from 'fs';
import path from 'path';


// Load env from root manually
const envPath = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');

    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // Remove quotes if present
            process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
    });
}


import { generateConjugations } from './llm';

async function test() {
    console.log('Testing generateConjugations for "eat"...');
    try {
        const result = await generateConjugations('eat', { language: 'en', infinitive: 'eat' });
        // Check Present Continuous
        const presentCont = result.tenses.find(t => t.tense_name === 'Present Continuous');
        if (presentCont) {
            console.log('Present Continuous:', JSON.stringify(presentCont.items, null, 2));
        } else {
            console.error('Present Continuous NOT FOUND');
        }

        // Check Present Perfect
        const presentPerf = result.tenses.find(t => t.tense_name === 'Present Perfect');
        if (presentPerf) {
            console.log('Present Perfect:', JSON.stringify(presentPerf.items, null, 2));
        } else {
            console.error('Present Perfect NOT FOUND');
        }

    } catch (e) {
        console.error(e);
    }
}

test();
