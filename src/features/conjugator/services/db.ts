
import { prisma } from '@/utils/prismaDB';
import { FullConjugationData } from '../types';
import { getLanguageId, getLanguageById } from './metadata';
import { FeedbackVoteType } from '@prisma/client';

/**
 * Search for an infinitive verb across ALL supported languages.
 * This is the primary DB lookup - checks if we already have this verb cached.
 */
export async function findVerbInAnyLanguage(word: string): Promise<{
    language: 'en' | 'fr' | 'es';
    infinitive: string;
} | null> {
    try {
        const translations = await prisma.verbTranslation.findMany({
            where: {
                word: word.toLowerCase()
            },
            select: {
                word: true,
                language_id: true
            }
        });

        if (translations && translations.length > 0) {
            for (const t of translations) {
                // Resolve language code using cached metadata
                const lang = await getLanguageById(t.language_id);
                if (lang && ['en', 'fr', 'es'].includes(lang.iso_code)) {
                    return {
                        language: lang.iso_code as 'en' | 'fr' | 'es',
                        infinitive: t.word
                    };
                }
            }
        }
        return null;
    } catch (error) {
        console.error('findVerbInAnyLanguage error:', error);
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
            // Resolve language
            const langCode = await getLanguageById(translation.language_id);

            if (langCode && ['en', 'fr', 'es'].includes(langCode.iso_code)) {
                return {
                    language: langCode.iso_code as 'en' | 'fr' | 'es',
                    infinitive: translation.word
                };
            }
        }

        return null;
    } catch (error) {
        console.error('findConjugatedVerb error:', error);
        return null;
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
 */
export async function saveConjugations(data: FullConjugationData): Promise<boolean> {
    try {
        const languageId = await getLanguageId(data.language);
        if (!languageId) {
            throw new Error(`Unknown language code ${data.language}`);
        }

        // 1. Upsert Concept
        const concept = await prisma.verbConcept.upsert({
            where: { concept_name: data.concept },
            update: {},
            create: {
                concept_name: data.concept,
                definition: data.definition
            }
        });
        const conceptId = concept.id;

        // 2. Upsert Translation
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

        // 3. Prepare Conjugation Rows
        const rows: any[] = [];
        let skippedCount = 0;

        data.tenses.forEach((t) => {
            t.items.forEach((item) => {
                if (item.tense_id && item.pronoun_id) {
                    // Logic: Aux + space + Root + End (matches DB trigger)
                    const aux = item.auxiliary || '';
                    const root = item.root || '';
                    const ending = item.ending || '';
                    const needsSpace = aux && !aux.endsWith("'");
                    const space = needsSpace ? ' ' : '';
                    const displayForm = (aux + space + root + ending).trim();

                    rows.push({
                        verb_translation_id: translationId,
                        tense_id: item.tense_id,
                        pronoun_id: item.pronoun_id,
                        auxiliary_part: item.auxiliary || null,
                        root_part: item.root,
                        ending_part: item.ending,
                        display_form: displayForm, // Allow Prisma to set this, even if trigger exists
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

        console.log(`Saving to DB: ${uniqueRows.length} unique rows, skipped ${skippedCount} missing IDs.`);

        if (uniqueRows.length > 0) {
            // Transaction: Delete existing -> Insert New
            await prisma.$transaction([
                prisma.conjugation.deleteMany({
                    where: { verb_translation_id: translationId }
                }),
                prisma.conjugation.createMany({
                    data: uniqueRows
                })
            ]);
        } else {
            console.warn('[DB Warn] No valid conjugation rows to save (all skipped).');
            return false;
        }

        console.log('[DB Success] Saved conjugations to database.');
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
