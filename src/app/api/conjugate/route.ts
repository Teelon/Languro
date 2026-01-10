
import { NextRequest, NextResponse } from 'next/server';
import { getExistingConjugations, saveConjugations, findVerbInAnyLanguage, findConjugatedVerb, findVerbFuzzy, findConjugatedVerbFuzzy, getSuggestions } from '@/features/conjugator/services/db';
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
        const normalizedVerb = verb.toLowerCase().trim();
        console.log(`[API] ═══════════════════════════════════════════════════`);
        console.log(`[API] � CONJUGATE REQUEST: "${normalizedVerb}" (preferred: ${language?.toUpperCase() || 'AUTO'})`);
        console.log(`[API] ═══════════════════════════════════════════════════`);

        // STEP 2: Search verb_translations (exact infinitive match)
        console.log(`[API] 🔍 STEP 2: Exact infinitive search...`);
        const foundInDb = await findVerbInAnyLanguage(normalizedVerb, language);

        if (foundInDb) {
            console.log(`[API] ✅ STEP 2 HIT: "${foundInDb.infinitive}" (${foundInDb.language.toUpperCase()})`);
            const existingData = await getExistingConjugations(foundInDb.infinitive, foundInDb.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[API] ⏱️  DONE: Returning cached data (${elapsed}s)`);
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
        console.log(`[API] ❌ STEP 2 MISS: No exact infinitive match`);

        // STEP 3: Reverse lookup by conjugated form
        console.log(`[API] 🔍 STEP 3: Reverse lookup (conjugated form)...`);
        const reverseMatch = await findConjugatedVerb(normalizedVerb, language);

        if (reverseMatch) {
            console.log(`[API] ✅ STEP 3 HIT: "${normalizedVerb}" → infinitive: "${reverseMatch.infinitive}" (${reverseMatch.language.toUpperCase()})`);
            const existingData = await getExistingConjugations(reverseMatch.infinitive, reverseMatch.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[API] ⏱️  DONE: Returning cached data (${elapsed}s)`);
                return NextResponse.json({
                    ...existingData,
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
        console.log(`[API] ❌ STEP 3 MISS: No conjugated form match`);

        // STEP 3.5: Fuzzy search fallback
        console.log(`[API] � STEP 3.5: Fuzzy search (typo correction)...`);

        const fuzzyInfinitive = await findVerbFuzzy(normalizedVerb, language);
        if (fuzzyInfinitive) {
            console.log(`[API] ✅ STEP 3.5 HIT: "${normalizedVerb}" ≈ "${fuzzyInfinitive.infinitive}" (${fuzzyInfinitive.language.toUpperCase()}, ${(fuzzyInfinitive.similarity * 100).toFixed(0)}% similar)`);
            const existingData = await getExistingConjugations(fuzzyInfinitive.infinitive, fuzzyInfinitive.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[API] ⏱️  DONE: Returning cached data (${elapsed}s)`);
                return NextResponse.json({
                    ...existingData,
                    metadata: {
                        source: 'db-cache-fuzzy',
                        originalInput: normalizedVerb,
                        detectedLanguage: fuzzyInfinitive.language,
                        wasFuzzyMatch: true,
                        similarity: fuzzyInfinitive.similarity
                    }
                });
            }
        }

        const fuzzyConjugated = await findConjugatedVerbFuzzy(normalizedVerb, language);
        if (fuzzyConjugated) {
            console.log(`[API] ✅ STEP 3.5 HIT: "${normalizedVerb}" ≈ "${fuzzyConjugated.matchedForm}" → "${fuzzyConjugated.infinitive}" (${fuzzyConjugated.language.toUpperCase()}, ${(fuzzyConjugated.similarity * 100).toFixed(0)}% similar)`);
            const existingData = await getExistingConjugations(fuzzyConjugated.infinitive, fuzzyConjugated.language);
            if (existingData) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[API] ⏱️  DONE: Returning cached data (${elapsed}s)`);
                return NextResponse.json({
                    ...existingData,
                    metadata: {
                        source: 'db-cache-fuzzy-conjugation',
                        originalInput: normalizedVerb,
                        detectedLanguage: fuzzyConjugated.language,
                        wasConjugatedForm: true,
                        wasFuzzyMatch: true,
                        matchedForm: fuzzyConjugated.matchedForm,
                        similarity: fuzzyConjugated.similarity
                    }
                });
            }
        }
        console.log(`[API] ❌ STEP 3.5 MISS: No fuzzy match`);

        console.log(`[API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`[API] ❌ NOT IN DB: "${normalizedVerb}" not found via exact, reverse, or fuzzy search`);

        // STEP 4: Light LLM call to detect language + infinitive
        console.log(`[API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`[API] � STEP 4: LLM Detection (preferred: ${language?.toUpperCase() || 'AUTO'})`);
        const detection = await detectLanguageAndInfinitive(normalizedVerb, language);

        let knownContext = undefined;

        if (detection) {
            if (detection.isValid) {
                console.log(`[API] ✅ STEP 4 RESULT: "${normalizedVerb}" IS a valid ${detection.language.toUpperCase()} verb → infinitive: "${detection.infinitive}"`);
            } else {
                console.log(`[API] ⚠️  STEP 4 RESULT: "${normalizedVerb}" is NOT a ${language?.toUpperCase() || 'valid'} verb`);
                console.log(`[API] 💡 STEP 4 DETECTED: Actually "${detection.infinitive}" (${detection.language.toUpperCase()})`);
            }

            // STEP 5: Search verb_translations again with detected infinitive
            if (detection.infinitive !== normalizedVerb) {
                console.log(`[API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`[API] 🔍 STEP 5: DB Check for suggested infinitive "${detection.infinitive}" (${detection.language.toUpperCase()})`);
                const foundInDbSecondary = await findVerbInAnyLanguage(detection.infinitive, detection.language);
                if (foundInDbSecondary && foundInDbSecondary.language === detection.language) {
                    console.log(`[API] ✅ STEP 5 HIT: Found "${detection.infinitive}" in database cache!`);
                    const existingData = await getExistingConjugations(detection.infinitive, detection.language);
                    if (existingData) {
                        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                        console.log(`[API] ⏱️  DONE: Returning cached data (${elapsed}s)`);
                        return NextResponse.json({
                            ...existingData,
                            metadata: {
                                source: 'db-cache-detected',
                                originalInput: normalizedVerb,
                                detectedLanguage: detection.language,
                                wasConjugatedForm: true,
                                detectedInfinitive: detection.infinitive,
                                wasSuggested: !detection.isValid
                            }
                        });
                    }
                }
                console.log(`[API] ❌ STEP 5 MISS: "${detection.infinitive}" not in DB, need to generate`);
            }

            // If not found in DB, use this context for generation
            knownContext = { language: detection.language, infinitive: detection.infinitive };
        } else {
            console.warn(`[Conjugate API] ⚠️ Step 4 FAILED: Detection uncertain`);

            // STEP 4.5: Fallback to fuzzy search in ANY language (no preference filter)
            console.log(`[Conjugate API] 🔮 Step 4.5: Fallback to fuzzy search (any language)...`);
            const anyLangFuzzy = await findVerbFuzzy(normalizedVerb, undefined, 0.3);
            if (anyLangFuzzy) {
                console.log(`[Conjugate API] ✅ Step 4.5 SUCCESS: Fuzzy found "${anyLangFuzzy.infinitive}" (${anyLangFuzzy.language}) - similarity: ${anyLangFuzzy.similarity.toFixed(2)}`);
                const existingData = await getExistingConjugations(anyLangFuzzy.infinitive, anyLangFuzzy.language);
                if (existingData) {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                    return NextResponse.json({
                        ...existingData,
                        metadata: {
                            source: 'db-cache-fuzzy-fallback',
                            originalInput: normalizedVerb,
                            detectedLanguage: anyLangFuzzy.language,
                            wasFuzzyMatch: true,
                            similarity: anyLangFuzzy.similarity
                        }
                    });
                }
            }

            // Nothing found anywhere - return error
            console.error(`[Conjugate API] ❌ Nothing found for "${normalizedVerb}" in any language`);
            return NextResponse.json({
                error: 'VERB_NOT_FOUND',
                message: `Could not find or recognize "${normalizedVerb}" as a verb in any language.`,
                originalInput: normalizedVerb
            }, { status: 404 });
        }

        // STEP 6: Full LLM call to generate conjugations
        console.log(`[API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`[API] 🤖 STEP 6: LLM Generation (using: "${knownContext?.infinitive || normalizedVerb}")`);
        const generatedData = await generateConjugations(normalizedVerb, knownContext);
        console.log(`[API] ✅ STEP 6 DONE: Generated "${generatedData.infinitive}" (${generatedData.language.toUpperCase()}) with ${generatedData.tenses.length} tenses`);

        // STEP 7: Save to DB
        console.log(`[API] 💾 STEP 7: Saving to database...`);
        const saved = await saveConjugations(generatedData);
        if (!saved) {
            console.error('[API] ❌ STEP 7 FAILED: Could not save to DB');
        } else {
            console.log(`[API] ✅ STEP 7 DONE: Cached "${generatedData.infinitive}" for future requests`);
        }

        // STEP 8: Get suggestions
        console.log(`[API] 💡 STEP 8: Fetching "Did you mean?" suggestions...`);
        const rawSuggestions = await getSuggestions(normalizedVerb, undefined, 0.6, 5);
        const filteredSuggestions = rawSuggestions.filter(
            s => s.word.toLowerCase() !== generatedData.infinitive.toLowerCase()
        );
        if (filteredSuggestions.length > 0) {
            console.log(`[API] 💡 STEP 8 RESULT: ${filteredSuggestions.length} suggestions (${filteredSuggestions.map(s => s.word).join(', ')})`);
        } else {
            console.log(`[API] 💡 STEP 8 RESULT: No suggestions (${rawSuggestions.length} filtered out)`);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[API] ═══════════════════════════════════════════════════`);
        console.log(`[API] ⏱️  DONE: LLM generated "${generatedData.infinitive}" (${elapsed}s)`);
        console.log(`[API] ═══════════════════════════════════════════════════`);

        return NextResponse.json({
            ...generatedData,
            metadata: {
                source: 'llm-generated',
                originalInput: normalizedVerb,
                detectedLanguage: generatedData.language,
                suggestions: filteredSuggestions.length > 0 ? filteredSuggestions : undefined
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
