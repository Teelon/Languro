
import { prisma } from '@/utils/prismaDB';
import { FullConjugationData } from '../types';
import { getLanguageId, getLanguageById } from './metadata';
import { FeedbackVoteType, Prisma } from '@prisma/client';

/**
 * Search for an infinitive verb across ALL supported languages.
 * This is the primary DB lookup - checks if we already have this verb cached.
 * Also searches for "to " + word to match English verbs stored with the "to " prefix.
 * If preferredLanguage is provided, only returns matches in that language.
 */
export async function findVerbInAnyLanguage(
    word: string,
    preferredLanguage?: 'en' | 'fr' | 'es'
): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
} | null> {
    const search = word.toLowerCase().trim();

    // For English, we store verbs with "to " prefix (e.g., "to come")
    // So we need to search for both "come" and "to come"
    const searchTerms = [search];
    if (!search.startsWith('to ')) {
        searchTerms.push(`to ${search}`);
    }

    console.log(`[DB] findVerbInAnyLanguage: Searching for ${JSON.stringify(searchTerms)} (preferred: ${preferredLanguage || 'any'})`);

    try {
        // Get preferred language ID if specified
        const preferredLangId = preferredLanguage ? await getLanguageId(preferredLanguage) : null;

        const translations = await prisma.verbTranslation.findMany({
            where: {
                word: { in: searchTerms }
            },
            select: {
                word: true,
                language_id: true
            }
        });

        console.log(`[DB] findVerbInAnyLanguage: Found ${translations.length} matches`);

        // If preferred language is set, ONLY return matches in that language
        if (preferredLangId) {
            const preferredMatch = translations.find(t => t.language_id === preferredLangId);
            if (preferredMatch) {
                const lang = await getLanguageById(preferredMatch.language_id);
                if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                    console.log(`[DB] findVerbInAnyLanguage: ✅ Match found (preferred lang): "${preferredMatch.word}" (${lang.iso_code})`);
                    return {
                        language: lang.iso_code as 'en' | 'fr' | 'es',
                        infinitive: preferredMatch.word
                    };
                }
            }
            // No match in preferred language - don't fall back to other languages!
            console.log(`[DB] findVerbInAnyLanguage: ❌ No match in preferred language (${preferredLanguage})`);
            return null;
        }

        // No preference - return first match
        if (translations && translations.length > 0) {
            for (const t of translations) {
                const lang = await getLanguageById(t.language_id);
                if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                    console.log(`[DB] findVerbInAnyLanguage: ✅ Match found: "${t.word}" (${lang.iso_code})`);
                    return {
                        language: lang.iso_code as 'en' | 'fr' | 'es',
                        infinitive: t.word
                    };
                }
            }
        }
        console.log(`[DB] findVerbInAnyLanguage: ❌ No match found`);
        return null;
    } catch (error) {
        console.error('[DB] findVerbInAnyLanguage error:', error);
        return null;
    }
}

/**
 * Search for a verb by its conjugated form (Reverse Lookup).
 * Returns the *infinitive* and *language* if found.
 */
export async function findConjugatedVerb(
    word: string,
    preferredLanguage?: 'en' | 'fr' | 'es'
): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
} | null> {
    const search = word.toLowerCase().trim();
    console.log(`[DB] findConjugatedVerb: Searching for "${search}" (preferred: ${preferredLanguage || 'any'})`);

    try {
        let whereClause: any = {
            display_form: {
                equals: search,
                mode: 'insensitive'
            }
        };

        if (preferredLanguage) {
            const langId = await getLanguageId(preferredLanguage);
            if (langId) {
                whereClause.verb_translation = {
                    language_id: langId
                };
            }
        }

        const conjugation = await prisma.conjugation.findFirst({
            where: whereClause,
            select: {
                verb_translation: {
                    select: {
                        word: true,
                        language_id: true
                    }
                }
            }
        });

        if (conjugation && conjugation.verb_translation) {
            const translation = conjugation.verb_translation;
            const langCode = await getLanguageById(translation.language_id);

            if (langCode && ['en', 'fr', 'es'].includes(langCode.iso_code)) {
                console.log(`[DB] findConjugatedVerb: ✅ Match found: "${translation.word}" (${langCode.iso_code})`);
                return {
                    language: langCode.iso_code as 'en' | 'fr' | 'es',
                    infinitive: translation.word
                };
            }
        }

        console.log(`[DB] findConjugatedVerb: ❌ No match found`);
        return null;
    } catch (error) {
        console.error('[DB] findConjugatedVerb error:', error);
        return null;
    }
}

/**
 * Fuzzy search for verbs using pg_trgm similarity.
 * Returns the best match above the threshold.
 * If preferredLanguage is provided, ONLY matches in that language are returned.
 * This prevents cross-language false positives (e.g., "come" ES matching "to come" EN).
 */
export async function findVerbFuzzy(
    word: string,
    preferredLanguage?: 'en' | 'fr' | 'es',
    threshold: number = 0.3
): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
    similarity: number;
} | null> {
    const search = word.toLowerCase().trim();
    console.log(`[DB] findVerbFuzzy: Searching for "${search}" (threshold: ${threshold}, preferred: ${preferredLanguage || 'any'})`);

    try {
        // Get language ID for filtering
        const preferredLangId = preferredLanguage ? await getLanguageId(preferredLanguage) : null;

        // Use raw SQL for pg_trgm similarity search
        const results = await prisma.$queryRaw<Array<{
            word: string;
            language_id: number;
            similarity: number;
        }>>`
            SELECT word, language_id, similarity(word, ${search}) as similarity
            FROM verb_translations
            WHERE similarity(word, ${search}) > ${threshold}
            ORDER BY similarity DESC
            LIMIT 10
        `;

        // If a preferred language is specified, ONLY return matches in that language
        if (preferredLangId) {
            const preferredMatch = results.find(r => r.language_id === preferredLangId);
            if (preferredMatch) {
                const lang = await getLanguageById(preferredMatch.language_id);
                if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                    console.log(`[DB] findVerbFuzzy: ✅ Fuzzy match (preferred lang only): "${preferredMatch.word}" (${lang.iso_code}) - similarity: ${preferredMatch.similarity.toFixed(3)}`);
                    return {
                        language: lang.iso_code as 'en' | 'fr' | 'es',
                        infinitive: preferredMatch.word,
                        similarity: preferredMatch.similarity
                    };
                }
            }
            // No match in preferred language - don't fall back to other languages!
            console.log(`[DB] findVerbFuzzy: ❌ No fuzzy match in preferred language (${preferredLanguage})`);
            return null;
        }

        // No preference specified - return best overall match
        if (results.length > 0) {
            const best = results[0];
            const lang = await getLanguageById(best.language_id);

            if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                console.log(`[DB] findVerbFuzzy: ✅ Fuzzy match: "${best.word}" (${lang.iso_code}) - similarity: ${best.similarity.toFixed(3)}`);
                return {
                    language: lang.iso_code as 'en' | 'fr' | 'es',
                    infinitive: best.word,
                    similarity: best.similarity
                };
            }
        }

        console.log(`[DB] findVerbFuzzy: ❌ No fuzzy match above threshold`);
        return null;
    } catch (error) {
        console.error('[DB] findVerbFuzzy error:', error);
        return null;
    }
}

/**
 * Fuzzy search for conjugated forms using pg_trgm similarity.
 * If preferredLanguage is provided, ONLY matches in that language are returned.
 * This prevents cross-language false positives.
 */
export async function findConjugatedVerbFuzzy(
    word: string,
    preferredLanguage?: 'en' | 'fr' | 'es',
    threshold: number = 0.4
): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
    matchedForm: string;
    similarity: number;
} | null> {
    const search = word.toLowerCase().trim();
    console.log(`[DB] findConjugatedVerbFuzzy: Searching for "${search}" (threshold: ${threshold}, preferred: ${preferredLanguage || 'any'})`);

    try {
        const preferredLangId = preferredLanguage ? await getLanguageId(preferredLanguage) : null;

        const results = await prisma.$queryRaw<Array<{
            display_form: string;
            word: string;
            language_id: number;
            similarity: number;
        }>>`
            SELECT c.display_form, vt.word, vt.language_id, similarity(c.display_form, ${search}) as similarity
            FROM conjugations c
            JOIN verb_translations vt ON c.verb_translation_id = vt.id
            WHERE similarity(c.display_form, ${search}) > ${threshold}
            ORDER BY similarity DESC
            LIMIT 10
        `;

        // If a preferred language is specified, ONLY return matches in that language
        if (preferredLangId) {
            const preferredMatch = results.find(r => r.language_id === preferredLangId);
            if (preferredMatch) {
                const lang = await getLanguageById(preferredMatch.language_id);
                if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                    console.log(`[DB] findConjugatedVerbFuzzy: ✅ Fuzzy match (preferred lang only): "${preferredMatch.display_form}" → "${preferredMatch.word}" (${lang.iso_code}) - similarity: ${preferredMatch.similarity.toFixed(3)}`);
                    return {
                        language: lang.iso_code as 'en' | 'fr' | 'es',
                        infinitive: preferredMatch.word,
                        matchedForm: preferredMatch.display_form,
                        similarity: preferredMatch.similarity
                    };
                }
            }
            // No match in preferred language - don't fall back to other languages!
            console.log(`[DB] findConjugatedVerbFuzzy: ❌ No fuzzy match in preferred language (${preferredLanguage})`);
            return null;
        }

        // No preference specified - return best overall match
        if (results.length > 0) {
            const best = results[0];
            const lang = await getLanguageById(best.language_id);

            if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                console.log(`[DB] findConjugatedVerbFuzzy: ✅ Fuzzy match: "${best.display_form}" → "${best.word}" (${lang.iso_code}) - similarity: ${best.similarity.toFixed(3)}`);
                return {
                    language: lang.iso_code as 'en' | 'fr' | 'es',
                    infinitive: best.word,
                    matchedForm: best.display_form,
                    similarity: best.similarity
                };
            }
        }

        console.log(`[DB] findConjugatedVerbFuzzy: ❌ No fuzzy match above threshold`);
        return null;
    } catch (error) {
        console.error('[DB] findConjugatedVerbFuzzy error:', error);
        return null;
    }
}

/**
 * Get suggestions for similar verbs (for "Did you mean?" feature).
 * Returns verbs with similarity >= minSimilarity.
 * Respects language preference if provided.
 */
export async function getSuggestions(
    word: string,
    preferredLanguage?: 'en' | 'fr' | 'es',
    minSimilarity: number = 0.4,
    limit: number = 5
): Promise<Array<{
    word: string;
    language: 'en' | 'fr' | 'es';
    similarity: number;
}>> {
    const search = word.toLowerCase().trim();
    console.log(`[DB] getSuggestions: Finding suggestions for "${search}" (min: ${minSimilarity}, lang: ${preferredLanguage || 'any'})`);

    try {
        const preferredLangId = preferredLanguage ? await getLanguageId(preferredLanguage) : null;

        // Query for similar verbs
        const results = await prisma.$queryRaw<Array<{
            word: string;
            language_id: number;
            similarity: number;
        }>>`
            SELECT word, language_id, similarity(word, ${search}) as similarity
            FROM verb_translations
            WHERE similarity(word, ${search}) >= ${minSimilarity}
            ORDER BY similarity DESC
            LIMIT ${limit * 2}
        `;

        // Filter by language if specified, otherwise take all
        const filteredResults = preferredLangId
            ? results.filter(r => r.language_id === preferredLangId)
            : results;

        // Map to output format
        const suggestions: Array<{ word: string; language: 'en' | 'fr' | 'es'; similarity: number }> = [];

        for (const result of filteredResults.slice(0, limit)) {
            const lang = await getLanguageById(result.language_id);
            if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                suggestions.push({
                    word: result.word,
                    language: lang.iso_code as 'en' | 'fr' | 'es',
                    similarity: result.similarity
                });
            }
        }

        console.log(`[DB] getSuggestions: Found ${suggestions.length} suggestions`);
        return suggestions;
    } catch (error) {
        console.error('[DB] getSuggestions error:', error);
        return [];
    }
}

/**
 * Get full conjugation data for a verb from the database.
 */
export async function getExistingConjugations(
    word: string,
    langCode: 'en' | 'fr' | 'es'
): Promise<FullConjugationData | null> {

    const languageId = await getLanguageId(langCode);
    if (!languageId) {
        console.warn(`getExistingConjugations: Unknown language code ${langCode}`);
        return null;
    }

    try {
        // Find Translation
        const translation = await prisma.verbTranslation.findFirst({
            where: {
                word: word.toLowerCase(),
                language_id: languageId
            },
            include: {
                concept: true,
                conjugations: {
                    include: {
                        tense: true,
                        pronoun: true
                    },
                    orderBy: [
                        { tense_id: 'asc' },
                        { pronoun_id: 'asc' }
                    ]
                }
            }
        });

        if (!translation) return null;

        const conjugations = translation.conjugations;
        if (!conjugations || conjugations.length === 0) return null;

        // Map to FullConjugationData
        const concept = translation.concept;
        const tensesMap = new Map<string, { mood: string; items: any[] }>();

        conjugations.forEach((c) => {
            if (!c.tense || !c.pronoun) {
                console.warn(`Skipping partial conjugation record id=${c.id}`);
                return;
            }

            const tenseName = c.tense.tense_name;
            const mood = c.tense.mood || 'Indicative';

            if (!tensesMap.has(tenseName)) {
                tensesMap.set(tenseName, { mood, items: [] });
            }

            // Reconstruct text from parts is implicit in `display_form` usually, 
            // but we reconstruct for consistency with existing FE logic if needed.
            // Or use DB parts.
            const aux = c.auxiliary_part ? c.auxiliary_part.trim() : '';
            const root = c.root_part || '';
            const ending = c.ending_part || '';
            const needsSpace = aux && !aux.endsWith("'");
            const space = needsSpace ? ' ' : '';
            const fullConjugatedText = (aux + space + root + ending).trim();

            tensesMap.get(tenseName)?.items.push({
                pronoun: c.pronoun.label,
                text: fullConjugatedText,
                auxiliary: c.auxiliary_part,
                root: c.root_part,
                ending: c.ending_part,
                pronoun_id: c.pronoun_id,
                tense_id: c.tense_id,
                has_audio: c.has_audio,
                // Assuming audio is still on Supabase Storage? 
                // We don't have direct access here easily without Supabase client. 
                // If needed, we can construct the URL if we know the bucket base URL.
                // For now, leaving undefined or constructing manually if bucket is known.
                audio_url: c.audio_file_key
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${c.audio_file_key}`
                    : undefined,
                conjugation_id: c.id,
                vote_score: c.vote_score || 0
            });
        });

        const tenses = Array.from(tensesMap.entries()).map(([name, data]) => {
            // Sort by ID to ensure order (already sorted by query but good to ensure)
            data.items.sort((a, b) => (a.pronoun_id || 0) - (b.pronoun_id || 0));
            return {
                tense_name: name,
                mood: data.mood,
                items: data.items
            };
        });

        return {
            concept: concept?.concept_name || '',
            definition: concept?.definition || '',
            infinitive: word,
            language: langCode,
            tenses
        };

    } catch (error) {
        console.error('getExistingConjugations error:', error);
        return null;
    }
}

/**
 * Save conjugation data to the database.
 * Note: display_form is calculated by DB trigger, so we don't set it here.
 */
export async function saveConjugations(data: FullConjugationData): Promise<boolean> {
    console.log(`[DB] saveConjugations: Saving "${data.infinitive}" (${data.language}) with ${data.tenses.length} tenses`);

    try {
        const languageId = await getLanguageId(data.language);
        if (!languageId) {
            console.error(`[DB] saveConjugations: Unknown language code "${data.language}"`);
            throw new Error(`Unknown language code ${data.language}`);
        }
        console.log(`[DB] saveConjugations: Language ID = ${languageId}`);

        // 1. Upsert Concept
        console.log(`[DB] saveConjugations: Upserting concept "${data.concept}"...`);
        const concept = await prisma.verbConcept.upsert({
            where: { concept_name: data.concept },
            update: {},
            create: {
                concept_name: data.concept,
                definition: data.definition
            }
        });
        const conceptId = concept.id;
        console.log(`[DB] saveConjugations: Concept ID = ${conceptId}`);

        // 2. Upsert Translation
        console.log(`[DB] saveConjugations: Upserting translation "${data.infinitive}"...`);
        const translation = await prisma.verbTranslation.upsert({
            where: {
                language_id_word: {
                    language_id: languageId,
                    word: data.infinitive.toLowerCase()
                }
            },
            update: { concept_id: conceptId },
            create: {
                language_id: languageId,
                word: data.infinitive.toLowerCase(),
                concept_id: conceptId
            }
        });
        const translationId = translation.id;
        console.log(`[DB] saveConjugations: Translation ID = ${translationId} (stored as "${translation.word}")`);

        // 3. Prepare Conjugation Rows - let DB trigger handle display_form
        const rows: any[] = [];
        let skippedCount = 0;

        data.tenses.forEach((t) => {
            t.items.forEach((item) => {
                if (item.tense_id && item.pronoun_id) {
                    rows.push({
                        verb_translation_id: translationId,
                        tense_id: item.tense_id,
                        pronoun_id: item.pronoun_id,
                        auxiliary_part: item.auxiliary || null,
                        root_part: item.root || '',
                        ending_part: item.ending || '',
                        // display_form is calculated by DB trigger - set placeholder
                        display_form: '',
                        has_audio: false,
                        vote_score: 0,
                        is_flagged: false
                    });
                } else {
                    skippedCount++;
                }
            });
        });

        // Deduplicate
        const uniqueMap = new Set<string>();
        const uniqueRows = rows.filter(r => {
            const key = `${r.verb_translation_id}-${r.tense_id}-${r.pronoun_id}`;
            if (uniqueMap.has(key)) return false;
            uniqueMap.add(key);
            return true;
        });

        console.log(`[DB] saveConjugations: ${uniqueRows.length} unique rows, skipped ${skippedCount} missing IDs`);

        if (uniqueRows.length > 0) {
            // Transaction: Delete existing -> Insert New
            console.log(`[DB] saveConjugations: Executing transaction (delete + create)...`);
            await prisma.$transaction([
                prisma.conjugation.deleteMany({
                    where: { verb_translation_id: translationId }
                }),
                prisma.conjugation.createMany({
                    data: uniqueRows
                })
            ]);
            console.log(`[DB] saveConjugations: ✅ Transaction complete`);
        } else {
            console.warn('[DB] saveConjugations: ⚠️ No valid conjugation rows to save (all skipped)');
            return false;
        }

        console.log(`[DB] saveConjugations: ✅ Successfully saved "${data.infinitive}" to database`);
        return true;

    } catch (error) {
        console.error('DB Save Error:', error);
        return false;
    }
}

/**
 * Submit user feedback (upvote/downvote) for a conjugation.
 */
export async function submitFeedback(
    conjugationId: number,
    voteType: 'up' | 'down',
    reason: string | null,
    ipHash: string,
    userId?: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await prisma.conjugationFeedback.create({
            data: {
                conjugation_id: conjugationId,
                vote_type: voteType as FeedbackVoteType,
                reason: reason,
                ip_hash: ipHash,
                user: userId ? { connect: { id: userId } } : undefined
            } as any // Cast to any to bypass stale Prisma types in IDE
        });

        return { success: true };
    } catch (error: any) {
        // Unique constraint violation code for Prisma
        if (error.code === 'P2002') {
            return { success: false, message: 'You have already voted on this item.' };
        }
        console.error('Submit Feedback Error:', error);
        return { success: false, message: 'Failed to submit feedback.' };
    }
}
