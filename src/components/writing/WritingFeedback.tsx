'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Correction {
    original: string;
    corrected: string;
    errorType: 'spelling' | 'grammar' | 'vocabulary' | 'style';
    explanation: string;
    explanationNative: string;
    startIndex: number;
    endIndex: number;
}

interface WritingFeedbackProps {
    originalText: string;
    correctedText: string;
    corrections: Correction[];
    overallFeedback: {
        target: string;
        native: string;
    };
    score: number;
    recognizedText?: string;
    inputMode: 'typed' | 'handwritten';
}

export function WritingFeedback({
    originalText,
    correctedText,
    corrections,
    overallFeedback,
    score,
    recognizedText,
    inputMode
}: WritingFeedbackProps) {
    const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);

    // Get score color
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-600 dark:text-green-400';
        if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    // Get error type badge color
    const getErrorBadgeVariant = (type: Correction['errorType']) => {
        switch (type) {
            case 'spelling': return 'destructive';
            case 'grammar': return 'default';
            case 'vocabulary': return 'secondary';
            case 'style': return 'outline';
        }
    };

    // Render text with highlighted corrections
    const renderHighlightedText = () => {
        if (corrections.length === 0) {
            return <span className="text-green-600 dark:text-green-400">{originalText}</span>;
        }

        // Sort corrections by startIndex
        const sortedCorrections = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedCorrections.forEach((correction, i) => {
            // Add text before this correction
            if (correction.startIndex > lastIndex) {
                elements.push(
                    <span key={`text-${i}`}>
                        {originalText.slice(lastIndex, correction.startIndex)}
                    </span>
                );
            }

            // Add highlighted correction
            elements.push(
                <span
                    key={`correction-${i}`}
                    className={cn(
                        'cursor-pointer px-0.5 rounded transition-colors',
                        selectedCorrection === correction
                            ? 'bg-red-200 dark:bg-red-900'
                            : 'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900'
                    )}
                    onClick={() => setSelectedCorrection(correction)}
                >
                    {correction.original}
                </span>
            );

            lastIndex = correction.endIndex;
        });

        // Add remaining text
        if (lastIndex < originalText.length) {
            elements.push(
                <span key="text-end">{originalText.slice(lastIndex)}</span>
            );
        }

        return elements;
    };

    return (
        <div className="space-y-4" data-testid="feedback-panel">
            {/* Score */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Score</h3>
                    <span className={cn('text-3xl font-bold', getScoreColor(score))}>
                        {Math.round(score)}%
                    </span>
                </div>
            </Card>

            {/* Handwriting Recognition Result - only show if different from analysis text */}
            {inputMode === 'handwritten' && recognizedText && (
                <Card className="p-4 space-y-2 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                        Recognized from Handwriting
                    </h3>
                    <p className="text-blue-900 dark:text-blue-100">
                        {recognizedText}
                    </p>
                </Card>
            )}

            {/* Original Text with Highlights - only show if there are corrections */}
            {corrections.length > 0 && (
                <Card className="p-4 space-y-2">
                    <h3 className="font-semibold">
                        {inputMode === 'handwritten' ? 'Text with Corrections' : 'Your Writing'}
                    </h3>
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                        {renderHighlightedText()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Click on highlighted text to see corrections
                    </p>
                </Card>
            )}

            {/* Selected Correction Detail */}
            {selectedCorrection && (
                <Card className="p-4 space-y-3 border-2 border-primary">
                    <div className="flex items-center justify-between">
                        <Badge variant={getErrorBadgeVariant(selectedCorrection.errorType)}>
                            {selectedCorrection.errorType}
                        </Badge>
                        <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedCorrection(null)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Original</p>
                            <p className="font-medium text-red-600 dark:text-red-400 line-through">
                                {selectedCorrection.original}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Corrected</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                                {selectedCorrection.corrected}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground">Explanation</p>
                            <p>{selectedCorrection.explanation}</p>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">In your language</p>
                            <p className="italic">{selectedCorrection.explanationNative}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Corrected Text */}
            {corrections.length > 0 && (
                <Card className="p-4 space-y-2 bg-green-50 dark:bg-green-950">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">
                        Corrected Version
                    </h3>
                    <p className="text-lg text-green-900 dark:text-green-100">
                        {correctedText}
                    </p>
                </Card>
            )}

            {/* Overall Feedback */}
            <Card className="p-4 space-y-4">
                <h3 className="font-semibold">Feedback</h3>

                <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">In your target language:</p>
                        <p>{overallFeedback.target}</p>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">In your native language:</p>
                        <p className="italic">{overallFeedback.native}</p>
                    </div>
                </div>
            </Card>

            {/* Corrections Summary */}
            {corrections.length > 0 && (
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">
                        All Corrections ({corrections.length})
                    </h3>
                    <div className="space-y-2">
                        {corrections.map((c, i) => (
                            <button
                                key={i}
                                className={cn(
                                    'w-full text-left p-2 rounded-lg transition-colors',
                                    selectedCorrection === c
                                        ? 'bg-primary/10'
                                        : 'hover:bg-muted'
                                )}
                                onClick={() => setSelectedCorrection(c)}
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant={getErrorBadgeVariant(c.errorType)} className="text-xs">
                                        {c.errorType}
                                    </Badge>
                                    <span className="text-red-600 dark:text-red-400 line-through">
                                        {c.original}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        {c.corrected}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
