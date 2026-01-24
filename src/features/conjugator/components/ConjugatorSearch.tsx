'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FullConjugationData } from '../types';
import { cn } from '@/lib/utils';
// Note: importing types from backend-only file might break if it imports server deps. 
// We'll define the API response types locally or use a shared types file. 
// For now, mirroring the shape here is safest to avoid "fs" import errors on client.

type SearchStatus = 'FOUND' | 'DID_YOU_MEAN' | 'NOT_FOUND' | 'NEEDS_GENERATION';

interface SearchResponse {
    status: SearchStatus;
    input: {
        raw: string;
        normalized: string;
        preferredLanguage?: 'en' | 'fr' | 'es';
    };
    match?: {
        language: 'en' | 'fr' | 'es';
        infinitive: string;
        source: 'EXACT' | 'REVERSE_EXACT' | 'FUZZY_ACCEPTED' | 'AI_LEMMA';
        confidence?: number;
    };
    suggestions?: Array<{
        language: 'en' | 'fr' | 'es';
        infinitive: string;
        source: 'FUZZY_LEMMA' | 'FUZZY_CONJ' | 'NEARBY';
        similarity?: number;
        matchedForm?: string;
    }>;
    needsGeneration?: boolean;
    message?: string;
    data?: FullConjugationData;
}

interface ConjugatorSearchProps {
    onData: (data: FullConjugationData) => void;
}

export default function ConjugatorSearch({ onData }: ConjugatorSearchProps) {
    const [verb, setVerb] = useState('');
    const [language, setLanguage] = useState<'en' | 'fr' | 'es'>('es');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResponse['suggestions']>([]);

    // "Generating" specific states
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentFact, setCurrentFact] = useState(0);
    const [progress, setProgress] = useState(0);

    // Rotate facts and update progress while generating
    useEffect(() => {
        let factInterval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isGenerating) {
            setProgress(0);

            // Rotate facts every 8s
            factInterval = setInterval(() => {
                setCurrentFact((prev) => (prev + 1) % LANGUAGE_FACTS.length);
            }, 8000);

            // Increment progress over ~62s
            // We want to reach ~95% in 62s, leaving 5% for the final complete call
            const duration = 62000;
            const interval = 100;
            const steps = duration / interval;
            const increment = 95 / steps;

            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) return 95;
                    return prev + increment;
                });
            }, interval);
        }

        return () => {
            clearInterval(factInterval);
            clearInterval(progressInterval);
        };
    }, [isGenerating]);

    // Handle initial search (check)
    const performSearch = useCallback(async (searchVerb: string, searchLang: 'en' | 'fr' | 'es', forceAi: boolean = false) => {
        if (!searchVerb.trim()) return;

        setVerb(searchVerb);
        setLanguage(searchLang);
        setLoading(true);
        setError('');
        setNotification('');
        setSuggestions([]);
        setIsGenerating(false);

        try {
            const res = await fetch('/api/conjugate/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verb: searchVerb,
                    language: searchLang,
                    forceAi
                }),
            });

            if (!res.ok) throw new Error('Search failed');

            const result: SearchResponse = await res.json();

            // Handle different statuses
            if (result.status === 'FOUND') {
                if (result.data) {
                    onData(result.data);
                    if (result.message) setNotification(result.message);
                } else if (result.match) {
                    // Should have data included technically, but if not, logic implies we have it cached?
                    // The generic search returns data if cached. 
                    // If source is AI_LEMMA and exact match found, data is sent.
                    setError("Data found but payload missing. Please try again.");
                }
            } else if (result.status === 'DID_YOU_MEAN') {
                setSuggestions(result.suggestions);
                if (result.message) setNotification(result.message);
                onData(null as any); // Clear results
            } else if (result.status === 'NEEDS_GENERATION' && result.match) {
                // Trigger generation flow
                triggerGeneration(result.match.infinitive, result.match.language);
            } else {
                // NOT_FOUND
                if (result.suggestions && result.suggestions.length > 0) {
                    setSuggestions(result.suggestions);
                    setNotification(result.message || 'Not found. Did you mean?');
                } else {
                    setError(result.message || 'Verb not found.');
                }
                onData(null as any);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [onData]);

    const triggerGeneration = async (infinitive: string, lang: 'en' | 'fr' | 'es') => {
        setIsGenerating(true);
        setCurrentFact(0);
        setLoading(true); // Keep main loading true or separate? Let's use isGenerating for UI overlay

        try {
            const res = await fetch('/api/conjugate/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    infinitive: infinitive,
                    language: lang
                }),
            });

            // If finished, jump progress to 100
            setProgress(100);

            const result: SearchResponse = await res.json();

            if (!res.ok) throw new Error(result.message || 'Generation failed');

            if (result.status === 'FOUND' && result.data) {
                onData(result.data);
                setNotification(result.message || 'Generated successfully!');
            } else if (result.status === 'NEEDS_GENERATION') {
                // Still waiting/locked? 
                setError("Generation is taking longer than expected. Please try again in 10 seconds.");
            } else {
                setError(result.message || 'Generation returned unexpected status.');
            }

        } catch (err: any) {
            setError(err.message || 'Generation failed');
        } finally {
            // Short delay to let user see 100% bar
            setTimeout(() => {
                setIsGenerating(false);
                setLoading(false);
                setProgress(0);
            }, 500);
        }
    };

    const handleSearch = () => {
        performSearch(verb, language);
    };

    const handleSuggestionClick = (s: { infinitive: string, language: 'en' | 'fr' | 'es' }) => {
        performSearch(s.infinitive, s.language);
    };

    const handleForceSearch = () => {
        performSearch(verb, language, true);
    };

    // Listen for cross-component events if needed
    useEffect(() => {
        const handleExternalSearch = (e: Event) => {
            const customEvent = e as CustomEvent<{ verb: string; language: 'en' | 'fr' | 'es' }>;
            performSearch(customEvent.detail.verb, customEvent.detail.language);
        };
        window.addEventListener('conjugator-search', handleExternalSearch);
        return () => window.removeEventListener('conjugator-search', handleExternalSearch);
    }, [performSearch]);

    return (
        <div className="mx-auto mb-8 max-w-[900px] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative min-w-[120px] sm:w-[140px]">
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
                    className="min-w-[140px] inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-primary/90 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            {isGenerating ? 'Creating...' : 'Searching...'}
                        </>
                    ) : (
                        'Conjugate'
                    )}
                </button>
            </div>

            {/* ERROR / NOTIFICATION */}
            {!loading && error && (
                <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
            {!loading && notification && !error && (
                <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex justify-between items-center flex-wrap gap-2">
                    <span>{notification}</span>
                    {/* Show force option if we are in DID_YOU_MEAN state */}
                    {suggestions && suggestions.length > 0 && !isGenerating && (
                        <button
                            onClick={handleForceSearch}
                            className="text-xs font-semibold underline hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Search exactly for "{verb}"?
                        </button>
                    )}
                </div>
            )}

            {/* DID YOU MEAN SUGGESTIONS */}
            {!loading && suggestions && suggestions.length > 0 && (
                <div className="mt-6">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                        Did you mean:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, idx) => (
                            <button
                                key={`${s.language}-${s.infinitive}-${idx}`}
                                onClick={() => handleSuggestionClick({ infinitive: s.matchedForm || s.infinitive, language: s.language })}
                                className="inline-flex items-center rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                <span className={cn("mr-2 text-xs uppercase opacity-50 font-bold",
                                    s.language === 'en' ? 'text-blue-500' :
                                        s.language === 'fr' ? 'text-purple-500' : 'text-orange-500'
                                )}>
                                    {s.language}
                                </span>
                                {s.matchedForm ? (
                                    <span>
                                        {s.matchedForm} <span className="opacity-50 mx-1">→</span> {s.infinitive}
                                    </span>
                                ) : (
                                    s.infinitive
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* GENERATING LOADING STATE */}
            {isGenerating && (
                <div className="mt-6 rounded-lg bg-blue-50/50 p-6 text-center dark:bg-blue-900/10 animate-in fade-in duration-300">
                    <div className="mb-4 flex justify-center">
                        <span className="relative flex h-4 w-4">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500"></span>
                        </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                        Generating high-quality verb tables using Pro AI...
                    </p>
                    <p className="mb-4 text-xs text-blue-600/80 dark:text-blue-400/80">
                        This takes about 60 seconds.
                    </p>

                    {/* Progress Bar */}
                    <div className="mx-auto max-w-sm mb-6">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mx-auto max-w-lg border-t border-blue-100 py-4 dark:border-blue-800/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 dark:text-blue-500/80 mb-2">
                            DID YOU KNOW?
                        </p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-300 min-h-[40px] transition-all duration-500" key={currentFact}>
                            "{LANGUAGE_FACTS[currentFact]}"
                        </p>
                    </div>
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
