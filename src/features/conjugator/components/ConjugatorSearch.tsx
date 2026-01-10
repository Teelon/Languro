
'use client';

import { useState, useEffect, useCallback } from 'react';


import { FullConjugationData } from '../types';

interface ConjugatorSearchProps {
    onData: (data: FullConjugationData) => void;
}

export default function ConjugatorSearch({ onData }: ConjugatorSearchProps) {
    const [verb, setVerb] = useState('');
    const [language, setLanguage] = useState<'en' | 'fr' | 'es'>('es');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [currentFact, setCurrentFact] = useState(0);
    const [showFacts, setShowFacts] = useState(false);

    // Rotate facts while loading
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showFacts) {
            interval = setInterval(() => {
                setCurrentFact((prev) => (prev + 1) % LANGUAGE_FACTS.length);
            }, 11000);
        }
        return () => clearInterval(interval);
    }, [showFacts]);

    // Perform search with given parameters
    const performSearch = useCallback(async (searchVerb: string, searchLang: 'en' | 'fr' | 'es') => {
        if (!searchVerb) return;
        setVerb(searchVerb);
        setLanguage(searchLang);
        setLoading(true);
        setShowFacts(false);
        setError('');
        setNotification('');
        setCurrentFact(0); // Reset facts

        try {
            // STEP 1: Fast check - does it exist or need generation?
            const res = await fetch('/api/conjugate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verb: searchVerb,
                    language: searchLang,
                    mode: 'check'
                }),
            });

            const data = await res.json();

            // Language mismatch handling (legacy, but good to keep)
            if (!res.ok && data.error === 'LANGUAGE_MISMATCH') {
                // ... existing mismatch logic could go here if needed ...
                // For now, let's assume the new API handles detection better
            }

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            // STEP 2: If basic check says "needsGeneration", we trigger the slow process
            if (data.needsGeneration) {
                // NOW we show the facts screen
                setShowFacts(true);

                // Call API again in 'generate' mode
                const genRes = await fetch('/api/conjugate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        verb: searchVerb,
                        language: searchLang,
                        mode: 'generate',
                        context: data.context // pass back the context LLM found
                    }),
                });

                const genData = await genRes.json();
                if (!genRes.ok) throw new Error(genData.error || 'Generation failed');

                onData(genData);
                setLoading(false);
                setShowFacts(false);
                return;
            }

            // Normal flow - data found in cache/DB immediately
            if (data.metadata) {
                if (data.metadata.wasConjugatedForm) {
                    setNotification(`Found conjugated form. Showing full conjugation for "${data.metadata.detectedInfinitive}".`);
                } else if (data.metadata.detectedLanguage && data.metadata.detectedLanguage !== searchLang) {
                    const languageNames: Record<string, string> = {
                        'en': 'English',
                        'fr': 'French',
                        'es': 'Spanish'
                    };
                    const suggestedName = languageNames[data.metadata.detectedLanguage];
                    const selectedName = languageNames[searchLang];
                    setNotification(`This appears to be a ${suggestedName} verb, but you selected ${selectedName}. Consider switching languages for better results.`);
                }
            }

            onData(data);
            setLoading(false);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred');
            setLoading(false);
            setShowFacts(false);
        }
    }, [onData]);

    // Handle search button click
    const handleSearch = useCallback(() => {
        performSearch(verb, language);
    }, [performSearch, verb, language]);

    // Listen for suggestion clicks from ConjugatorResults
    useEffect(() => {
        const handleSuggestionClick = (e: Event) => {
            const customEvent = e as CustomEvent<{ verb: string; language: 'en' | 'fr' | 'es' }>;
            performSearch(customEvent.detail.verb, customEvent.detail.language);
        };

        window.addEventListener('conjugator-search', handleSuggestionClick);
        return () => window.removeEventListener('conjugator-search', handleSuggestionClick);
    }, [performSearch]);

    return (
        <div className="mx-auto mb-8 max-w-[900px] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative min-w-[150px]">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-8 text-base text-slate-600 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        aria-label="Language selection"
                    >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 dark:text-gray-400">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1">
                    <input
                        type="text"
                        value={verb}
                        onChange={(e) => setVerb(e.target.value)}
                        placeholder="e.g. comer, manger, run"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-slate-600 placeholder-slate-500/60 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="min-w-[150px] inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-primary/90 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Searching...
                        </>
                    ) : (
                        'Conjugate'
                    )}
                </button>
            </div>

            {showFacts && (
                <div className="mt-6 rounded-lg bg-blue-50/50 p-6 text-center dark:bg-blue-900/10">
                    <div className="mb-3 flex justify-center">
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                        </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                        Generating new verb tables (this takes ~20s)...
                    </p>
                    <p className="mb-4 text-xs text-blue-600/80 dark:text-blue-400/80">
                        We're adding this to our database so next time it will be instant! 🚀
                    </p>

                    <div className="mx-auto max-w-lg border-t border-blue-100 py-3 dark:border-blue-800/30">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 dark:text-blue-500">
                            Did you know?
                        </p>
                        <p className="mt-1 text-sm italic text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-500" key={currentFact}>
                            "{LANGUAGE_FACTS[currentFact]}"
                        </p>
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {!loading && notification && (
                <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {notification}
                </div>
            )}
        </div>
    );
}

const LANGUAGE_FACTS = [
    "Spanish has two verbs for 'to be' (ser and estar), which often confuses learners but adds nuance.",
    "English is one of the few languages where the future tense uses a helper verb (will) instead of a suffix.",
    "French verb endings in the present tense (-e, -es, -e, -ent) are often silent, making listening tricky!",
    "The most common verb in the English language is 'be'.",
    "Japanese has no future tense; it uses the present tense with time words.",
    "In German, the verb often gets kicked to the very end of the sentence.",
    "Arabic verbs are based on a root system of usually three letters.",
    "Mandarin Chinese verbs do not conjugate for person, number, or tense!",
    "Approximately 7,000 languages are spoken in the world today.",
    "Language learning actually increases the size of your brain!",
    "The English word 'run' has over 645 different meanings.",
    "Spanish is the second most spoken native language in the world after Mandarin.",
    "French was the official language of England for over 300 years (1066-1362)."
];
