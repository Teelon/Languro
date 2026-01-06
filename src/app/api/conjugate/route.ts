
import { NextRequest, NextResponse } from 'next/server';
import { getExistingConjugations, saveConjugations, findVerbInAnyLanguage, findConjugatedVerb } from '@/features/conjugator/services/db';
import { generateConjugations, detectLanguageAndInfinitive } from '@/features/conjugator/services/llm';

export const maxDuration = 60; // Allow 60s for LLM processing if needed (Vercel Pro)

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        const { verb, language } = body;

        // Note: 'language' is used as a HINT/PREFERENCE for homographs (e.g. "comes" -> English vs Spanish).
        // If exact match fails, we use this to prioritize the Reverse Lookup.

        if (!verb) {
            return NextResponse.json({ error: 'Verb is required' }, { status: 400 });
        }

        // STEP 1: Normalize Input
        const normalizedVerb = verb.toLowerCase().trim().replace(/^to\s+/, '');
        console.log(`[Conjugate API] 🔍 Searching for: "${normalizedVerb}"`);

        // STEP 2: Universal DB Search (ALL Languages) - EXACT MATCH
        console.log(`[Conjugate API] 🌍 Searching DB (Exact Match)...`);
        const foundInDb = await findVerbInAnyLanguage(normalizedVerb);

        if (foundInDb) {
            console.log(`[Conjugate API] ✅ Found in DB as ${foundInDb.language.toUpperCase()} verb: "${foundInDb.infinitive}"`);

            const existingData = await getExistingConjugations(foundInDb.infinitive, foundInDb.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[Conjugate API] ✅ Returning DB data - took ${elapsed}s`);
                return NextResponse.json({
                    ...existingData,
                    metadata: {
                        source: 'db-cache',
                        originalInput: normalizedVerb,
                        detectedLanguage: foundInDb.language
                    }
                });
            }
        }

        // STEP 2.5: Reverse Lookup (Conjugated Form Search in DB)
        // If user typed "runs", we check if "runs" exists in `display_form` column.
        // We pass the 'preferredLanguage' to prioritize homographs (e.g. "comes" EN vs ES).
        console.log(`[Conjugate API] 🔍 Reverse Lookup (Conjugated check) with perf-lang: ${language || 'none'}...`);
        const reverseMatch = await findConjugatedVerb(normalizedVerb, language);

        if (reverseMatch) {
            console.log(`[Conjugate API] ✅ Found via Reverse Lookup! "${normalizedVerb}" -> "${reverseMatch.infinitive}" (${reverseMatch.language})`);
            const existingData = await getExistingConjugations(reverseMatch.infinitive, reverseMatch.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[Conjugate API] ✅ Returning DB data (Reverse) - took ${elapsed}s`);
                return NextResponse.json({
                    ...existingData,
                    // We add a hint about the conjugated form
                    metadata: {
                        source: 'db-cache-reverse',
                        originalInput: normalizedVerb,
                        detectedLanguage: reverseMatch.language,
                        wasConjugatedForm: true,
                        detectedInfinitive: reverseMatch.infinitive
                    }
                });
            }
        }

        console.log(`[Conjugate API] ❌ Not found in DB (Exact or Reverse)`);

        // STEP 3: Identification / Detection Step (Lightweight LLM)
        // Optimizes token usage - if we detect it's "run" (en), we can check DB for "run" BEFORE full generation.
        console.log(`[Conjugate API] 🕵️ Detecting Language & Infinitive...`);
        const detection = await detectLanguageAndInfinitive(normalizedVerb);

        let knownContext = undefined;

        if (detection) {
            console.log(`[Conjugate API] 💡 Detected: "${detection.infinitive}" (${detection.language})`);

            // Check DB again with the *Detected Infinitive*
            if (detection.infinitive !== normalizedVerb) { // Avoid double checking if no change
                const foundInDbSecondary = await findVerbInAnyLanguage(detection.infinitive);
                if (foundInDbSecondary && foundInDbSecondary.language === detection.language) {
                    console.log(`[Conjugate API] ✅ Found "${detection.infinitive}" in DB after detection!`);
                    const existingData = await getExistingConjugations(detection.infinitive, detection.language);
                    if (existingData) {
                        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                        return NextResponse.json({
                            ...existingData,
                            metadata: {
                                source: 'db-cache-detected',
                                originalInput: normalizedVerb,
                                detectedLanguage: detection.language,
                                wasConjugatedForm: true,
                                detectedInfinitive: detection.infinitive
                            }
                        });
                    }
                }
            }

            // If not found in DB, use this context for generation
            knownContext = detection;
        } else {
            console.warn(`[Conjugate API] ⚠️ Detection failed or uncertain. Falling back to full generation.`);
        }

        // STEP 4: Call LLM - Full Generation
        console.log(`[Conjugate API] 🤖 Calling Gemini API for generation...`);
        const generatedData = await generateConjugations(normalizedVerb, knownContext);
        console.log(`[Conjugate API] ✅ Gemini returned: "${generatedData.infinitive}" (${generatedData.language.toUpperCase()})`);

        // STEP 5: Validate & Save to DB
        console.log(`[Conjugate API] 💾 Saving to database...`);
        const saved = await saveConjugations(generatedData);
        if (!saved) {
            console.error('[Conjugate API] ❌ Failed to save to DB');
        } else {
            console.log(`[Conjugate API] ✅ Saved "${generatedData.infinitive}" to DB`);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[Conjugate API] ⏱️ Request completed in ${elapsed}s`);

        return NextResponse.json(generatedData);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
