
import { useState, useMemo, SyntheticEvent, useEffect } from 'react';
import { FullConjugationData } from '../types';
import toast from 'react-hot-toast';
import FeedbackModal from './FeedbackModal';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Simple Icon Components
const IconVolume2 = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

const IconThumbUp = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
);

const IconThumbDown = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
);

interface ConjugatorResultsProps {
    data: FullConjugationData;
}

const TENSE_PRIORITY = [
    // --- PRESENT ---
    'Simple Present', 'Presente', 'Présent',
    'Present Continuous',

    // --- PAST ---
    'Simple Past', 'Pretérito Perfecto Simple', 'Passé Simple', 'Passé Composé',
    'Imperfect', 'Pretérito Imperfecto', 'Imparfait',
    'Past Continuous',
    'Present Perfect', 'Pretérito Perfecto Compuesto', // Often grouped with past in UI, or separate
    'Past Perfect', 'Pretérito Pluscuamperfecto', 'Plus-que-parfait',

    // --- FUTURE ---
    'Future Simple (Will)', 'Futuro Simple', 'Futur Simple',

    // --- CONDITIONAL ---
    'Conditional (Would)', 'Condicional Simple', 'Conditionnel Présent',

    // --- SUBJUNCTIVE ---
    'Present Subjunctive', 'Subjuntivo Presente', 'Subjonctif Présent',
    'Imperfect Subjunctive', 'Subjuntivo Imperfecto', 'Subjonctif Imparfait',

    // --- IMPERATIVE ---
    'Imperative', 'Imperativo Afirmativo', 'Impératif Présent'
];

const PRONOUN_PRIORITY = [
    // 1st Sing
    'Yo', 'Je / J\'', 'Je', "J'", 'I',
    // 2nd Sing
    'Tú', 'Tu', 'You',
    // 3rd Sing
    'Él / Ella / Usted', 'Il / Elle / On', 'He/She/It', 'He / She / It',
    // 1st Plural
    'Nosotros', 'Nosotras', 'Nous', 'We',
    // 2nd Plural
    'Vosotros', 'Vosotras', 'Vous', 'You (all)', 'You (pl)',
    // 3rd Plural
    'Ellos / Ellas / Ustedes', 'Ils / Elles', 'They'
];

const getTenseIndex = (name: string) => {
    const index = TENSE_PRIORITY.indexOf(name);
    return index === -1 ? 999 : index;
};

const getPronounIndex = (name: string) => {
    const index = PRONOUN_PRIORITY.indexOf(name);
    // Fallback for partial matches if needed, but exact matches preferred for now
    if (index === -1) return 999;
    return index;
};

export default function ConjugatorResults({ data }: ConjugatorResultsProps) {
    const { data: session } = useSession();
    const [currentTab, setCurrentTab] = useState(0);

    // Notification dismissal state
    const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

    const dismissNotification = (id: string) => {
        setDismissedNotifications(prev => new Set(prev).add(id));
    };

    // Audio Playback State
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<Set<string>>(new Set());

    const playAudio = async (item: { text: string; pronoun: string; audio_url?: string }, tenseName: string) => {
        // Create a unique key for loading state
        const audioKey = `${tenseName}-${item.pronoun}-${item.text}`;

        if (loadingAudio.has(audioKey)) return;
        if (playingUrl === audioKey) return;

        // If we already have a direct URL (and it's not our loading key), use it? 
        // NOTE: We prefer hitting our API to get a fresh signed URL.

        try {
            setLoadingAudio(prev => new Set(prev).add(audioKey));
            console.time(`Audio Fetch: ${audioKey}`);

            // Construct API URL
            const params = new URLSearchParams({
                type: 'conjugation',
                language: data.language,
                verb: data.infinitive,
                tense: tenseName,
                pronoun: item.pronoun,
                conjugated: item.text
            });

            const response = await fetch(`/api/audio?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to get audio URL');
            }

            const result = await response.json();
            if (!result.success || !result.url) {
                throw new Error(result.error || 'Invalid audio response');
            }

            console.timeEnd(`Audio Fetch: ${audioKey}`);

            const audio = new Audio(result.url);

            // Wait for audio to be ready to play
            audio.oncanplaythrough = () => {
                setLoadingAudio(prev => {
                    const next = new Set(prev);
                    next.delete(audioKey);
                    return next;
                });
                setPlayingUrl(audioKey);
                audio.play().catch(e => {
                    console.error("Play error:", e);
                    setPlayingUrl(null);
                    toast.error("Could not play audio");
                });
            };

            audio.onended = () => {
                setPlayingUrl(null);
            };

            audio.onerror = () => {
                console.error("Audio playback error");
                setLoadingAudio(prev => {
                    const next = new Set(prev);
                    next.delete(audioKey);
                    return next;
                });
                setPlayingUrl(null);
                toast.error("Failed to play audio");
            };

            // Trigger load
            audio.load();

        } catch (error) {
            console.error('Audio Error:', error);
            toast.error('Failed to load audio');
            setLoadingAudio(prev => {
                const next = new Set(prev);
                next.delete(audioKey);
                return next;
            });
        }
    };

    // HITL State
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [selectedConjugationId, setSelectedConjugationId] = useState<number | null>(null);
    const [votedIds, setVotedIds] = useState<Set<number>>(new Set());


    // Load voted IDs from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('voted_conjugations');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                if (Array.isArray(ids)) {
                    setVotedIds(new Set(ids.map(Number))); // Ensure numbers
                }
            } catch (e) {
                console.error("Failed to parse voted conjugations", e);
            }
        }
    }, []);

    const handleVote = async (id: number, type: 'up' | 'down', reason: string = '') => {
        if (!id) return;

        // Open modal for downvotes if no reason provided
        if (type === 'down' && !reason) {
            setSelectedConjugationId(id);
            setFeedbackOpen(true);
            return;
        }

        try {
            // Corrected API endpoint
            const response = await fetch('/api/conjugate/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conjugationId: id, voteType: type, reason }),
            });

            const result = await response.json();

            if (response.ok) {
                setVotedIds(prev => {
                    const next = new Set(prev).add(id);
                    localStorage.setItem('voted_conjugations', JSON.stringify(Array.from(next)));
                    return next;
                });
                toast.success(type === 'up' ? 'Thanks for the upvote!' : 'Thanks for your feedback!');
            } else {
                toast.error(result.error || 'Failed to submit vote.');
            }
        } catch (error) {
            console.error('Vote Error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setFeedbackOpen(false);
        }
    };

    // Group tenses by Mood
    const groupedTenses = useMemo(() => {
        const groups: Record<string, typeof data.tenses> = {
            'Indicative': [],
            'Subjunctive': [],
            'Imperative': [],
            'Conditional': []
        };

        const others: typeof data.tenses = [];

        data.tenses.forEach(tense => {
            // Clone and sort items
            const sortedItems = [...tense.items].sort((a, b) => {
                const idxA = getPronounIndex(a.pronoun);
                const idxB = getPronounIndex(b.pronoun);
                if (idxA !== idxB) return idxA - idxB;
                return a.pronoun.localeCompare(b.pronoun);
            });

            const processedTense = { ...tense, items: sortedItems };

            if (processedTense.mood && groups[processedTense.mood]) {
                groups[processedTense.mood].push(processedTense);
            } else {
                others.push(processedTense);
            }
        });

        // Sort tenses within each group
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                const idxA = getTenseIndex(a.tense_name);
                const idxB = getTenseIndex(b.tense_name);
                if (idxA !== idxB) return idxA - idxB;
                return a.tense_name.localeCompare(b.tense_name);
            });
        });

        // Filter out empty groups but keep specific order
        const orderedKeys = ['Indicative', 'Subjunctive', 'Imperative', 'Conditional'];
        const result: { label: string, tenses: typeof data.tenses }[] = [];

        orderedKeys.forEach(key => {
            if (groups[key].length > 0) {
                result.push({ label: key, tenses: groups[key] });
            }
        });

        if (others.length > 0) {
            others.sort((a, b) => {
                const idxA = getTenseIndex(a.tense_name);
                const idxB = getTenseIndex(b.tense_name);
                if (idxA !== idxB) return idxA - idxB;
                return a.tense_name.localeCompare(b.tense_name);
            });
            result.push({ label: 'Other', tenses: others });
        }

        return result;
    }, [data]);

    return (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-4">
                    <h1 className="text-4xl font-bold capitalize text-dark dark:text-white">
                        {data.infinitive}
                    </h1>
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 dark:border-slate-600 dark:text-gray-400">
                        {data.concept}
                    </span>
                    <span className="text-4xl">
                        {data.language === 'es' ? '🇪🇸' : data.language === 'fr' ? '🇫🇷' : 'EN'}
                    </span>
                </div>

                {/* Translation / Detection Feedback */}
                {data.metadata && (
                    <div className="mt-4 space-y-2">
                        {data.metadata.wasTranslation && !dismissedNotifications.has('translation') && (
                            <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                <p>
                                    Translated from <strong>{data.metadata.originalInput}</strong> ({data.metadata.sourceLanguage?.toUpperCase()}) to <strong>{data.infinitive}</strong> ({data.metadata.targetLanguage?.toUpperCase()}).
                                </p>
                                <button
                                    onClick={() => dismissNotification('translation')}
                                    className="ml-4 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
                                    aria-label="Dismiss notification"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {!data.metadata.wasTranslation && data.metadata.originalInput && data.metadata.originalInput.toLowerCase() !== data.infinitive.toLowerCase() && !dismissedNotifications.has('found') && (
                            <div className="flex items-center justify-between rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                <p>
                                    Found <strong>{data.infinitive}</strong> for <em>"{data.metadata.originalInput}"</em>.
                                </p>
                                <button
                                    onClick={() => dismissNotification('found')}
                                    className="ml-4 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
                                    aria-label="Dismiss notification"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {!data.metadata.wasTranslation && data.metadata.source === 'db-fallback' && !dismissedNotifications.has('fallback') && (
                            <div className="flex items-center justify-between rounded-md bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                                <p>
                                    "{data.metadata.originalInput}" was found in <strong>{data.language === 'fr' ? 'French' : data.language === 'es' ? 'Spanish' : 'English'}</strong>. Switched language automatically.
                                </p>
                                <button
                                    onClick={() => dismissNotification('fallback')}
                                    className="ml-4 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
                                    aria-label="Dismiss notification"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {/* Did you mean? Suggestions */}
                        {data.metadata.suggestions && data.metadata.suggestions.length > 0 && !dismissedNotifications.has('suggestions') && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">Did you mean:</span>
                                    {data.metadata.suggestions.map((suggestion: { word: string; language: string; similarity: number }, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                // Dispatch custom event to trigger search
                                                window.dispatchEvent(new CustomEvent('conjugator-search', {
                                                    detail: { verb: suggestion.word, language: suggestion.language }
                                                }));
                                            }}
                                            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium transition hover:bg-amber-200 dark:bg-amber-800/40 dark:hover:bg-amber-700/50"
                                        >
                                            {suggestion.word}
                                            <span className="text-xs opacity-70">
                                                ({suggestion.language === 'es' ? '🇪🇸' : suggestion.language === 'fr' ? '🇫🇷' : '🇬🇧'})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => dismissNotification('suggestions')}
                                    className="rounded p-1 opacity-60 transition-opacity hover:opacity-100"
                                    aria-label="Dismiss notification"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {groupedTenses.map((group, index) => (
                        <button
                            key={group.label}
                            onClick={() => setCurrentTab(index)}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                ${currentTab === index
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }
                            `}
                            aria-current={currentTab === index ? 'page' : undefined}
                        >
                            {group.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            {groupedTenses.map((group, index) => (
                <div
                    key={group.label}
                    className={currentTab === index ? 'block' : 'hidden'}
                    role="tabpanel"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {group.tenses.map((tense) => (
                            <Card
                                key={tense.tense_name}
                                className="group flex h-full flex-col transition hover:border-primary hover:shadow-md dark:hover:border-primary"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {tense.tense_name}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-2">
                                    {tense.items.map((item, idx) => {
                                        const isVoted = !!(item.conjugation_id && votedIds.has(item.conjugation_id));

                                        return (
                                            <div
                                                key={idx}
                                                className="group/item relative flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                                            >
                                                <div className="flex w-full items-center gap-2 pr-12">
                                                    {/* Audio Button */}
                                                    {/* Audio Button */}
                                                    <button
                                                        onClick={() => playAudio(item, tense.tense_name)}
                                                        disabled={loadingAudio.has(`${tense.tense_name}-${item.pronoun}-${item.text}`)}
                                                        title="Play Pronunciation"
                                                        className={`
                                                            flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform
                                                            ${(playingUrl === `${tense.tense_name}-${item.pronoun}-${item.text}` || loadingAudio.has(`${tense.tense_name}-${item.pronoun}-${item.text}`))
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted text-muted-foreground hover:scale-110 hover:bg-primary/20 hover:text-primary'
                                                            }
                                                        `}
                                                    >
                                                        {loadingAudio.has(`${tense.tense_name}-${item.pronoun}-${item.text}`) ? (
                                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        ) : playingUrl === `${tense.tense_name}-${item.pronoun}-${item.text}` ? (
                                                            <IconVolume2 size={14} className="animate-pulse" />
                                                        ) : (
                                                            <IconVolume2 size={14} />
                                                        )}
                                                    </button>

                                                    <div className="leading-tight">
                                                        <span className="mr-2 inline-block text-sm font-medium text-muted-foreground">
                                                            {item.pronoun}
                                                        </span>
                                                        <span className="text-base font-bold text-foreground">
                                                            {item.root ? (
                                                                <>
                                                                    {item.auxiliary && (
                                                                        <span className="mr-1 opacity-70">{item.auxiliary}</span>
                                                                    )}
                                                                    <span className="opacity-90">{item.root}</span>
                                                                    <span className="text-primary">{item.ending}</span>
                                                                </>
                                                            ) : (
                                                                item.text
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* HITL Vote Actions */}
                                                {item.conjugation_id && (
                                                    <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                                                        <button
                                                            onClick={() => item.conjugation_id && handleVote(item.conjugation_id, 'up')}
                                                            disabled={isVoted}
                                                            className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                                        >
                                                            <IconThumbUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => item.conjugation_id && handleVote(item.conjugation_id, 'down')}
                                                            disabled={isVoted}
                                                            title="Report Issue"
                                                            className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            <IconThumbDown size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <FeedbackModal
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                onSubmit={(reason) => selectedConjugationId && handleVote(selectedConjugationId, 'down', reason)}
                isLoggedIn={!!session?.user}
            />
        </div>
    );
}
