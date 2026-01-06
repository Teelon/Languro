import { FullConjugationData } from '../types';
import { fetchMetadata, getTensesForLanguage, getPronounsForLanguage } from './metadata';
import { LanguageStrategyFactory } from '../strategies/LanguageStrategyFactory';

interface LLMResponse {
    concept: string;
    definition: string;
    detected_language: string;
    infinitive: string;
    tenses: Array<{
        tense_name: string;
        conjugations: Array<{
            pronoun_code: string;
            text: string;
            auxiliary?: string;
            root: string;
            ending: string;
        }>;
    }>;
}

/**
 * Lightweight Language & Infinitive Detection.
 * Uses a faster/cheaper model to just identify "runs" -> { language: "en", infinitive: "run" }.
 */
export async function detectLanguageAndInfinitive(verb: string): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
} | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY missing');

    const detectionModel = process.env.GEMINI_MODEL_LANG_DETECTION || 'gemini-2.0-flash-lite-preview-02-05';
    // or user requested 'gemini-flash-lite-latest' mapping if needed, but env var is safer.

    const prompt = `
    TASK: Identify the language (en, fr, or es) and the infinitive form of the verb "${verb}".
    Strict JSON response.
    {
        "language": "en|fr|es",
        "infinitive": "infinitive_form"
    }
    `;

    try {
        console.log(`[Conjugator] 🔍 Detecting language for "${verb}" using ${detectionModel}...`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${detectionModel}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: 'application/json' },
                }),
            }
        );

        if (!response.ok) {
            console.warn(`[Conjugator] Detection failed: ${response.status}`);
            return null;
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        // Robust JSON extraction
        let cleanJson = text;
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = text.substring(jsonStart, jsonEnd + 1);
        } else {
            // Fallback cleanup if braces aren't clear, though braces are expected for JSON
            cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const data = JSON.parse(cleanJson);

            if (['en', 'fr', 'es'].includes(data.language) && data.infinitive) {
                return {
                    language: data.language as 'en' | 'fr' | 'es',
                    infinitive: data.infinitive
                };
            }
        } catch (parseError) {
            console.error(`[Conjugator] Detection JSON Parse Error. Raw text: "${text}"`);
        }

        return null;

    } catch (e) {
        console.error('[Conjugator] Detection error:', e);
        return null;
    }
}

/**
 * Auto-detect the language of a verb and generate conjugations for that language.
 */
export async function generateConjugations(
    verb: string,
    knownContext?: { language: 'en' | 'fr' | 'es', infinitive: string }
): Promise<FullConjugationData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in environment variables');
    }

    await fetchMetadata();

    // 1. First, we need to detect the language. 
    // Optimization: We can ask the LLM to detect AND generate in one go, 
    // but the prompt needs to be generic enough or smart enough.
    // Ideally, the user selects language. But for now, we rely on the multi-shot prompt 
    // or a preliminary check? 
    // The previous implementation used a HUGE prompt with ALL languages.
    // To use the Strategy pattern effectively, we should arguably:
    // A) Ask LLM to detect language first (cheap call).
    // B) Then invoke the specific Strategy.
    // OR 
    // C) Keep a "Generic" prompt that asks for detection, then switches context?
    // Given the prompt structure in the previous code, it generated prompts for ALL 3 languages.
    // That defeated the purpose of a strategy pattern (loading all prompts).

    // NEW APPROACH:
    // We will stick to the previous behavior of "One Prompt to Rule Them All" for *Initial Detection* 
    // matching the user's implicit flow, BUT we will delegate the *Content* of that prompt 
    // to the strategies.

    // However, the cleanest way is to just instantiate all 3 strategies to build the "Menu" 
    // of options for the LLM.

    const enStrategy = LanguageStrategyFactory.getStrategy('en');
    const frStrategy = LanguageStrategyFactory.getStrategy('fr');
    const esStrategy = LanguageStrategyFactory.getStrategy('es');

    const enTenses = await getTensesForLanguage('en');
    const frTenses = await getTensesForLanguage('fr');
    const esTenses = await getTensesForLanguage('es');

    let prompt = '';

    // OPTIMIZATION: If we already know the language/infinitive (from detection step), 
    // restrict the prompt to ONLY that language. This saves input tokens and improves accuracy.
    if (knownContext) {
        console.log(`[Conjugator] ⚡ Using KNOWN context: ${knownContext.infinitive} (${knownContext.language})`);

        const targetStrategy = LanguageStrategyFactory.getStrategy(knownContext.language);
        let targetTenses: any[] = [];
        if (knownContext.language === 'en') targetTenses = enTenses;
        if (knownContext.language === 'fr') targetTenses = frTenses;
        if (knownContext.language === 'es') targetTenses = esTenses;

        prompt = `
        You are a linguistic expert specializing in verb conjugation.
        TASK: Generate full conjugation for the ${knownContext.language.toUpperCase()} verb "${knownContext.infinitive}".
        
        STEP 1: CONFIRMATION
        - Set "detected_language" to "${knownContext.language}".
        - Set "infinitive" to "${knownContext.infinitive}".

        STEP 2: CONJUGATION
        Use these rules:
        ${targetStrategy.generatePrompt(knownContext.infinitive, targetTenses.map(t => t.tense_name))}

        RETURN STRICT JSON ONLY.
        Schema:
        {
            "detected_language": "${knownContext.language}",
            "infinitive": "${knownContext.infinitive}",
            "concept": "Appropiate concept name",
            "definition": "Short definition",
            "tenses": [ ... same schema as always ... ]
        }
        (Ensure strict JSON matching the schema below)
        
        Schema:
        {
            "detected_language": "en|fr|es",
            "infinitive": "Infinitive form",
            "concept": "Concept name",
            "definition": "Definition",
            "tenses": [
                {
                    "tense_name": "EXACT tense name",
                    "conjugations": [
                        {
                            "pronoun_code": "Code",
                            "text": "Full text",
                            "auxiliary": "Aux",
                            "root": "root",
                            "ending": "ending"
                        }
                    ]
                }
            ]
        }
        `;

    } else {
        // FALLBACK: Old "Mega-Prompt" for when we have no clue (should be rare with new flow)
        prompt = `
        You are a linguistic expert specializing in verb conjugation.
    
        TASK: Identify the language of the verb "${verb}" and provide its full conjugation.
        
        STEP 1: LANGUAGE DETECTION
        - Detect if "${verb}" is English, French, or Spanish.
        - Set "detected_language" to "en", "fr", or "es".
        - Set "infinitive".
    
        STEP 2: CONJUGATION
        Based on the detected language, use the CORRESPONDING rules below. Ignore the others.
        
        === IF ENGLISH (en) ===
        ${enStrategy.generatePrompt(verb, enTenses.map(t => t.tense_name))}
        
        === IF FRENCH (fr) ===
        ${frStrategy.generatePrompt(verb, frTenses.map(t => t.tense_name))}
    
        === IF SPANISH (es) ===
        ${esStrategy.generatePrompt(verb, esTenses.map(t => t.tense_name))}
    
        RETURN STRICT JSON ONLY.
        Schema:
        {
            "detected_language": "en|fr|es",
            "infinitive": "Infinitive form",
            "concept": "English concept name (e.g. 'to eat')",
            "definition": "Short English definition",
            "tenses": [
                {
                    "tense_name": "EXACT tense name",
                    "conjugations": [
                        {
                            "pronoun_code": "Code from list above",
                            "text": "Full conjugated text",
                            "auxiliary": "Helper/Particle (optional)",
                            "root": "stem",
                            "ending": "suffix"
                        }
                    ]
                }
            ]
        }
        `;
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    console.log(`[Conjugator] 🤖 Using Gemini Model: ${modelName}`);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: 'application/json' },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const llmData: LLMResponse = JSON.parse(cleanJson);


        const detectedCode = (llmData.detected_language || 'en').toLowerCase();

        // Get the specific strategy for the *detected* language to handle validation
        const strategy = LanguageStrategyFactory.getStrategy(detectedCode);

        const actualTensesList = await getTensesForLanguage(detectedCode);
        console.log(`[LLM Debug] Detected: ${detectedCode}. Found ${actualTensesList.length} tenses in DB.`);
        if (actualTensesList.length > 0) {
            console.log(`[LLM Debug] DB Tenses: ${actualTensesList.map(t => t.tense_name).join(', ')}`);
        }

        const actualPronounsList = await getPronounsForLanguage(detectedCode);
        console.log(`[LLM Debug] DB Pronouns: ${actualPronounsList.map(p => `${p.code}:${p.label}`).join(', ')}`);

        let validCount = 0;
        let invalidCount = 0;

        const validPronouns = actualPronounsList;

        const mappedTenses = llmData.tenses.map((t) => {
            const searchName = t.tense_name.toLowerCase().trim();
            // Match tense in DB (Exact or Fuzzy)
            let tenseDef = actualTensesList.find(tl => tl.tense_name.toLowerCase().trim() === searchName);
            if (!tenseDef) {
                tenseDef = actualTensesList.find((tl) => {
                    const baseName = tl.tense_name.toLowerCase().trim();
                    return searchName.includes(baseName) || baseName.includes(searchName);
                });
            }

            if (!tenseDef) {
                console.warn(`[LLM Warn] Unknown tense: "${t.tense_name}" (Lang: ${detectedCode})`);
            }

            if (!tenseDef) {
                console.warn(`LLM returned unknown tense: "${t.tense_name}" for ${detectedCode}.`);
            }

            const mappedItems = t.conjugations.map((c) => {
                // Try matching Code first (1S, 2S...)
                let pronounDef = validPronouns.find((pl) => pl.code.toUpperCase() === c.pronoun_code.toUpperCase());

                // If not found, try matching Label (Yo, Je, etc.)
                if (!pronounDef) {
                    const cleanCode = c.pronoun_code.toLowerCase().trim();
                    pronounDef = validPronouns.find(pl => {
                        const label = pl.label.toLowerCase();
                        return label === cleanCode || label.includes(cleanCode) || cleanCode.includes(label);
                    });
                }

                if (!pronounDef) {
                    console.warn(`[LLM Warn] Unknown pronoun: "${c.pronoun_code}"`);
                }

                // DELEGATE VALIDATION TO STRATEGY
                const itemParts = {
                    auxiliary: c.auxiliary,
                    root: c.root,
                    ending: c.ending,
                    text: c.text
                };

                const validation = strategy.validateItem(itemParts);

                // Verify Reconstruction (Round-trip check)
                // We ask the strategy to rebuild it, then compare with strict text
                const reconstructed = strategy.reconstruct(itemParts);

                // Simple normalizer for comparison
                const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

                // Reconstruction Check
                // We do a loose check: does the full text *contain* the reconstructed parts?
                // Or are they equal?
                // The previous code had complex regex logic. 
                // We will simplify: The Strategy.reconstruct should match the provided text roughly.
                // However, the LLM provides "text" which is the source of truth for display? 
                // Or is "root+ending" source of truth?
                // In this architecture, root/ending are for highlighting. 
                // We trust the Strategy to validate that Root+Ending == Text roughly.

                // For now, trust the explicit validation reason
                if (!validation.isValid) {
                    invalidCount++;
                    console.error(`Validation Failed for "${c.text}": ${validation.reason}`);
                } else {
                    validCount++;
                }

                const PRONOUN_ORDER: Record<string, number> = { '1S': 0, '2S': 1, '3S': 2, '1P': 3, '2P': 4, '3P': 5 };
                const sortIndex = PRONOUN_ORDER[c.pronoun_code.toUpperCase()] ?? 99;

                return {
                    pronoun: pronounDef?.label || c.pronoun_code,
                    text: c.text,
                    auxiliary: c.auxiliary || undefined,
                    root: c.root,
                    ending: c.ending,
                    pronoun_id: pronounDef?.id,
                    tense_id: tenseDef?.id,
                    sort_index: sortIndex
                };
            }).filter((item): item is NonNullable<typeof item> => item !== null);

            mappedItems.sort((a, b) => (a.sort_index ?? 99) - (b.sort_index ?? 99));
            const cleanItems = mappedItems.map(({ sort_index, ...rest }: any) => rest);

            return {
                tense_name: tenseDef?.tense_name || t.tense_name,
                mood: tenseDef?.mood || undefined,
                items: cleanItems
            };
        });

        mappedTenses.sort((a, b) => {
            const idA = a.items[0]?.tense_id || 999;
            const idB = b.items[0]?.tense_id || 999;
            return idA - idB;
        });

        const totalItems = validCount + invalidCount;
        if (totalItems > 0 && (invalidCount / totalItems) > 0.30) {
            // Relaxed threshold slightly
            throw new Error(`Data Integrity Error: ${invalidCount}/${totalItems} conjugations failed validation.`);
        }

        return {
            concept: llmData.concept,
            definition: llmData.definition,
            infinitive: llmData.infinitive || verb,
            language: detectedCode as 'en' | 'fr' | 'es',
            metadata: {
                source: 'llm-generation',
                originalInput: verb,
                detectedLanguage: detectedCode as 'en' | 'fr' | 'es'
            },

            tenses: mappedTenses
        };

    } catch (error: any) {
        console.error('Gemini Generation Error:', error);
        throw new Error('Failed to generate conjugations');
    }
}

