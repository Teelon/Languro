
'use client';

import { useState } from 'react';


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

    const handleSearch = async () => {
        if (!verb) return;
        setLoading(true);
        setError('');
        setNotification('');

        try {
            const res = await fetch('/api/conjugate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verb, language }),
            });

            const data = await res.json();

            // Check for language mismatch error
            if (!res.ok && data.error === 'LANGUAGE_MISMATCH') {
                const languageNames: Record<string, string> = {
                    'en': 'English',
                    'fr': 'French',
                    'es': 'Spanish'
                };
                const suggestedName = languageNames[data.suggestedLanguage];
                const selectedName = languageNames[language];

                // Show immediate switching message
                setNotification(
                    `"${data.word}" appears to be a ${suggestedName} word, not ${selectedName}. Switching to ${suggestedName}...`
                );
                // Keep loading spinner visible  
                setLoading(true);

                // Auto-switch to suggested language and re-search
                setTimeout(async () => {
                    setLanguage(data.suggestedLanguage);

                    // Update notification to show we're searching
                    setNotification(`Searching for "${verb}" in ${suggestedName}...`);

                    // Re-search with correct language
                    const retryRes = await fetch('/api/conjugate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ verb, language: data.suggestedLanguage }),
                    });
                    const retryData = await retryRes.json();
                    if (retryRes.ok) {
                        onData(retryData);
                        setNotification(`✓ Switched to ${suggestedName} and found "${retryData.infinitive}".`);
                    } else {
                        setError(`Could not find "${verb}" in ${suggestedName}`);
                    }
                    setLoading(false);
                }, 800);


                return;
            }

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            // Check metadata for helpful messages
            if (data.metadata) {
                if (data.metadata.wasConjugatedForm) {
                    setNotification(`Found conjugated form. Showing full conjugation for "${data.metadata.detectedInfinitive}".`);
                } else if (data.metadata.detectedLanguage && data.metadata.detectedLanguage !== language) {
                    const languageNames: Record<string, string> = {
                        'en': 'English',
                        'fr': 'French',
                        'es': 'Spanish'
                    };
                    const suggestedName = languageNames[data.metadata.detectedLanguage];
                    const selectedName = languageNames[language];
                    setNotification(`This appears to be a ${suggestedName} verb, but you selected ${selectedName}. Consider switching languages for better results.`);
                }
            }

            onData(data);
            setLoading(false); // Turn off loading after successful load
        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Only set loading false on actual error
        }
    };

    return (
        <div className="mx-auto mb-8 max-w-[900px] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative min-w-[150px]">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 pr-8 text-base text-body-color transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-dark-2 dark:text-white"
                        aria-label="Language selection"
                    >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-body-color dark:text-gray-400">
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
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-body-color placeholder-body-color/60 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-dark-2 dark:text-white"
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

            {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {notification && (
                <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {notification}
                </div>
            )}
        </div>
    );
}
