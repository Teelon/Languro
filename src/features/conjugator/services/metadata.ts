

import { prisma } from '@/utils/prismaDB';
import { Language, Tense, Pronoun } from '@prisma/client';

// Types matching the DB (Prisma types are similar, alias if needed)
export type DB_Language = Language;
export type DB_Tense = Tense;
export type DB_Pronoun = Pronoun;

// Simple in-memory cache
let cache: {
    languages: DB_Language[];
    tenses: DB_Tense[];
    pronouns: DB_Pronoun[];
    timestamp: number;
} | null = null;

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function fetchMetadata() {
    // Check cache
    const now = Date.now();
    if (cache && (now - cache.timestamp < CACHE_TTL)) {
        return cache;
    }

    try {
        const [languages, tenses, pronouns] = await Promise.all([
            prisma.language.findMany(),
            prisma.tense.findMany(),
            prisma.pronoun.findMany()
        ]);

        console.log(`fetchMetadata: Fetched ${languages.length} languages, ${tenses.length} tenses, ${pronouns.length} pronouns.`);

        cache = {
            languages,
            tenses,
            pronouns,
            timestamp: now
        };

        return cache;
    } catch (error) {
        console.error('fetchMetadata: Error fetching metadata', error);
        throw error;
    }
}

export async function getTensesForLanguage(langCode: string) {
    const data = await fetchMetadata();
    const lang = data.languages.find(l => l.iso_code === langCode);
    if (!lang) return [];

    return data.tenses.filter(t => t.language_id === lang.id);
}

export async function getPronounsForLanguage(langCode: string) {
    const data = await fetchMetadata();
    const lang = data.languages.find(l => l.iso_code === langCode);
    if (!lang) return [];

    // Sort by ID to ensure standard order (1S, 2S, 3S, 1P, 2P, 3P)
    return data.pronouns
        .filter(p => p.language_id === lang.id)
        .sort((a, b) => a.id - b.id);
}

export async function getLanguageId(langCode: string) {
    const data = await fetchMetadata();
    return data.languages.find(l => l.iso_code.toLowerCase() === langCode.toLowerCase())?.id;
}

export async function getLanguageById(id: number) {
    const data = await fetchMetadata();
    return data.languages.find(l => l.id === id);
}

export async function getLanguageByCode(langCode: string) {
    const data = await fetchMetadata();
    return data.languages.find(l => l.iso_code === langCode);
}

