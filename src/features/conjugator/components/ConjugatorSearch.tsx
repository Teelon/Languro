'use client';

import { useState, useEffect, useCallback } from 'react';
import { FullConjugationData } from '../types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Languages,
    Sparkles,
    ChevronRight,
    Loader2,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

const LANGUAGE_FACTS = [
    "Spanish has two verbs for 'to be' (ser and estar), which often confuses learners.",
    "English is one of the few languages where the future tense uses a helper verb (will).",
    "French verb endings in the present tense (-e, -es, -e, -ent) are often silent.",
    "The most common verb in the English language is 'be'.",
    "Japanese has no future tense; it uses the present tense with time words.",
    "In German, the verb often gets kicked to the very end of the sentence.",
    "Arabic verbs are based on a root system of usually three letters.",
    "Mandarin Chinese verbs do not conjugate for person, number, or tense!",
    "Language learning actually increases the size of your brain!",
    "The English word 'run' has over 645 different meanings.",
    "Spanish is the second most spoken native language in the world.",
    "French was the official language of England for over 300 years."
];

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
            factInterval = setInterval(() => {
                setCurrentFact((prev) => (prev + 1) % LANGUAGE_FACTS.length);
            }, 6000);

            const duration = 60000;
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

            if (result.status === 'FOUND') {
                if (result.data) {
                    onData(result.data);
                    if (result.message) setNotification(result.message);
                } else {
                    setError("Data found but payload missing. Please try again.");
                }
            } else if (result.status === 'DID_YOU_MEAN') {
                setSuggestions(result.suggestions);
                if (result.message) setNotification(result.message);
                onData(null as any);
            } else if (result.status === 'NEEDS_GENERATION' && result.match) {
                triggerGeneration(result.match.infinitive, result.match.language);
            } else {
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
        setLoading(true);

        try {
            const res = await fetch('/api/conjugate/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    infinitive,
                    language: lang
                }),
            });

            setProgress(100);
            const result: SearchResponse = await res.json();

            if (!res.ok) throw new Error(result.message || 'Generation failed');

            if (result.status === 'FOUND' && result.data) {
                onData(result.data);
                setNotification(result.message || 'Generated successfully!');
            } else {
                setError(result.message || 'Generation failed.');
            }
        } catch (err: any) {
            setError(err.message || 'Generation failed');
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setLoading(false);
                setProgress(0);
            }, 800);
        }
    };

    const handleSearch = () => performSearch(verb, language);

    useEffect(() => {
        const handleExternalSearch = (e: Event) => {
            const customEvent = e as CustomEvent<{ verb: string; language: 'en' | 'fr' | 'es' }>;
            performSearch(customEvent.detail.verb, customEvent.detail.language);
        };
        window.addEventListener('conjugator-search', handleExternalSearch);
        return () => window.removeEventListener('conjugator-search', handleExternalSearch);
    }, [performSearch]);

    return (
        <div className="mx-auto mb-10 max-w-2xl px-4">
            <motion.div
                layout
                className="relative z-10 overflow-hidden rounded-xl border bg-white/70 shadow-xl backdrop-blur-md dark:bg-slate-900/70 border-white/20 dark:border-slate-800/50"
            >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 gap-1.5">
                    <div className="flex items-center gap-1.5 px-1.5 sm:border-r dark:border-slate-800">
                        <Languages className="h-3.5 w-3.5 text-primary opacity-70" />
                        <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                            <SelectTrigger className="w-[100px] border-0 bg-transparent focus:ring-0 shadow-none font-medium h-8 text-xs">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es" className="text-xs">Spanish</SelectItem>
                                <SelectItem value="en" className="text-xs">English</SelectItem>
                                <SelectItem value="fr" className="text-xs">French</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 relative flex items-center">
                        <Input
                            type="text"
                            value={verb}
                            onChange={(e) => setVerb(e.target.value)}
                            placeholder="Type a verb..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm h-8"
                        />
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={loading || !verb}
                        className="rounded-lg px-4 h-8 bg-primary hover:bg-primary/90 transition-all duration-300 text-xs py-0"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline mr-1.5">Conjugate</span>
                                <Search className="h-3.5 w-3.5" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* ERROR & NOTIFICATION */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400 border border-red-500/20"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                    </motion.div>
                )}
                {notification && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-500/10 p-3 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    >
                        <div className="flex items-center gap-2">
                            <Info className="h-3.5 w-3.5" />
                            {notification}
                        </div>
                        {suggestions && suggestions.length > 0 && !isGenerating && (
                            <button
                                onClick={() => performSearch(verb, language, true)}
                                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 underline underline-offset-2"
                            >
                                Force AI
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SUGGESTIONS */}
            <AnimatePresence>
                {!loading && suggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 overflow-hidden"
                    >
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Did you mean:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestions.map((s, idx) => (
                                <motion.button
                                    key={`${s.language}-${s.infinitive}-${idx}`}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => performSearch(s.matchedForm || s.infinitive, s.language)}
                                    className="group flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-primary/10"
                                >
                                    <span className={cn(
                                        "text-[9px] font-black uppercase opacity-60",
                                        s.language === 'en' ? 'text-blue-500' :
                                            s.language === 'fr' ? 'text-purple-500' : 'text-orange-500'
                                    )}>
                                        {s.language}
                                    </span>
                                    {s.matchedForm ? (
                                        <span className="text-[11px]">
                                            {s.matchedForm} <ChevronRight className="inline-block h-2.5 w-2.5 opacity-30" /> {s.infinitive}
                                        </span>
                                    ) : (
                                        <span className="text-[11px]">{s.infinitive}</span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GENERATING STATE */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="mt-8 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 dark:border-blue-800/30 dark:from-slate-900/50 dark:to-blue-950/20"
                    >
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                <Sparkles className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
                                Mastering "{verb}"...
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Building professional conjugation tables.
                            </p>
                        </div>

                        <div className="mx-auto max-w-xs">
                            <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                <span>Generating</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/50 dark:bg-blue-900/50">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 border-t border-blue-200/50 pt-4 dark:border-blue-800/20">
                            <p className="mb-2 text-center text-[9px] font-black uppercase tracking-widest text-blue-500/60">
                                Language Fact
                            </p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentFact}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-center text-xs italic leading-relaxed text-slate-700 dark:text-slate-300 px-4"
                                >
                                    "{LANGUAGE_FACTS[currentFact]}"
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

