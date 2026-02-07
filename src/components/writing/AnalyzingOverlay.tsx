'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';

interface AnalyzingOverlayProps {
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
}

// Language tips organized by level
const getTipsForLevel = (level: string, targetLanguage: string): string[] => {
    const beginnerTips = [
        `In ${targetLanguage}, pay attention to noun genders - they affect adjective endings!`,
        `Try to use simple sentence structures: subject + verb + object`,
        `Don't worry about perfection - making mistakes is how we learn!`,
        `Reading out loud helps you remember vocabulary better`,
        `Start with common everyday words before tackling complex vocabulary`,
    ];

    const intermediateTips = [
        `Using connecting words like "however", "therefore", and "although" makes your writing flow better`,
        `Try to vary your sentence lengths for more engaging writing`,
        `Pay attention to verb tenses - consistency is key!`,
        `Native speakers often use idiomatic expressions - try including one!`,
        `Proofreading your work once before submitting catches many simple errors`,
    ];

    const advancedTips = [
        `Consider the register of your writing - formal vs informal language`,
        `Nuanced vocabulary choices can dramatically improve your expression`,
        `Pay attention to subtle differences in synonyms`,
        `Native-like writing often uses passive voice strategically`,
        `Consider cultural context when choosing expressions`,
    ];

    switch (level.toUpperCase()) {
        case 'A1':
        case 'A2':
            return beginnerTips;
        case 'B1':
        case 'B2':
            return intermediateTips;
        case 'C1':
        case 'C2':
            return advancedTips;
        default:
            return intermediateTips;
    }
};

const loadingMessages = [
    { text: "Reading your writing...", icon: BookOpen },
    { text: "Checking grammar and spelling...", icon: MessageSquare },
    { text: "Preparing helpful feedback...", icon: Lightbulb },
    { text: "Almost there...", icon: Sparkles },
];

export function AnalyzingOverlay({ targetLanguage, nativeLanguage, cefrLevel }: AnalyzingOverlayProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [currentTip, setCurrentTip] = useState('');
    const tips = getTipsForLevel(cefrLevel, targetLanguage);

    // Rotate through loading messages
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 5000);

        return () => clearInterval(messageInterval);
    }, []);

    // Pick a random tip on mount
    useEffect(() => {
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, [tips]);

    const CurrentIcon = loadingMessages[currentMessageIndex].icon;

    return (
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col items-center text-center space-y-6">
                {/* Animated loader */}
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <div className="relative bg-primary/10 rounded-full p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>

                {/* Dynamic status message */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-lg font-medium">
                        <CurrentIcon className="h-5 w-5 text-primary animate-pulse" />
                        <span className="transition-all duration-300">
                            {loadingMessages[currentMessageIndex].text}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Our AI is analyzing your {targetLanguage} writing
                    </p>
                </div>

                {/* Language tip card */}
                <div className="w-full max-w-md mt-4">
                    <div className="bg-background/60 backdrop-blur rounded-lg p-4 border border-primary/10">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-500/10 rounded-full p-2 shrink-0">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                                    💡 Did you know?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {currentTip}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5">
                    {loadingMessages.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === currentMessageIndex
                                ? 'bg-primary w-4'
                                : 'bg-primary/30'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
}
