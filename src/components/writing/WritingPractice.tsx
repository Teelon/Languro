'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, PenLine, Keyboard, RefreshCw } from 'lucide-react';
import { WritingPromptCard } from './WritingPromptCard';
import { WritingInput } from './WritingInput';
import { WritingFeedback } from './WritingFeedback';
import { AnalyzingOverlay } from './AnalyzingOverlay';

interface WritingPracticeProps {
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
}

interface Prompt {
    id: string;
    text: string;
    imageUrl: string;
    language: string;
    level: string;
}

interface Correction {
    original: string;
    corrected: string;
    errorType: 'spelling' | 'grammar' | 'vocabulary' | 'style';
    explanation: string;
    explanationNative: string;
    startIndex: number;
    endIndex: number;
}

interface Submission {
    id: string;
    originalText: string;
    recognizedText?: string;
    correctedText: string;
    corrections: Correction[];
    overallFeedback: {
        target: string;
        native: string;
    };
    score: number;
}

export function WritingPractice({ targetLanguage, nativeLanguage, cefrLevel }: WritingPracticeProps) {
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [inputMode, setInputMode] = useState<'typed' | 'handwritten'>('typed');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePrompt = async () => {
        setIsGenerating(true);
        setError(null);
        setSubmission(null);

        try {
            const response = await fetch('/api/writing/generate-prompt', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate prompt');
            }

            setPrompt(data.prompt);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (text: string, imageFile?: File) => {
        if (!prompt) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            let response: Response;

            if (inputMode === 'handwritten' && imageFile) {
                // Multipart form for image upload
                const formData = new FormData();
                formData.append('promptId', prompt.id);
                formData.append('inputType', 'handwritten');
                formData.append('image', imageFile);

                response = await fetch('/api/writing/analyze', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // JSON for typed text
                response = await fetch('/api/writing/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        promptId: prompt.id,
                        inputType: 'typed',
                        text
                    })
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze writing');
            }

            setSubmission(data.submission);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSubmission(null);
        setPrompt(null);
    };

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex gap-2">
                <Button
                    variant={inputMode === 'typed' ? 'default' : 'outline'}
                    onClick={() => setInputMode('typed')}
                    className="flex items-center gap-2"
                >
                    <Keyboard className="h-4 w-4" />
                    Type
                </Button>
                <Button
                    variant={inputMode === 'handwritten' ? 'default' : 'outline'}
                    onClick={() => setInputMode('handwritten')}
                    className="flex items-center gap-2"
                >
                    <PenLine className="h-4 w-4" />
                    Handwrite
                </Button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* No Prompt State */}
            {!prompt && !submission && (
                <Card className="p-8 text-center border-2 border-dashed">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Ready to practice writing?</h2>
                        <p className="text-muted-foreground">
                            We'll show you an image to describe in {targetLanguage}.<br />
                            Your level: <strong>{cefrLevel}</strong>
                        </p>
                        <Button
                            size="lg"
                            onClick={generatePrompt}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Start Practice'
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Active Prompt */}
            {prompt && !submission && !isAnalyzing && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Image and Prompt */}
                    <WritingPromptCard
                        imageUrl={prompt.imageUrl}
                        promptText={prompt.text}
                        language={prompt.language}
                    />

                    {/* Input Area */}
                    <WritingInput
                        mode={inputMode}
                        onSubmit={handleSubmit}
                        isLoading={isAnalyzing}
                        targetLanguage={targetLanguage}
                    />
                </div>
            )}

            {/* Analyzing State - Interactive Loading */}
            {isAnalyzing && (
                <AnalyzingOverlay
                    targetLanguage={targetLanguage}
                    nativeLanguage={nativeLanguage}
                    cefrLevel={cefrLevel}
                />
            )}

            {/* Feedback Display */}
            {submission && (
                <div className="space-y-6">
                    <WritingFeedback
                        originalText={submission.originalText}
                        correctedText={submission.correctedText}
                        corrections={submission.corrections}
                        overallFeedback={submission.overallFeedback}
                        score={submission.score}
                        recognizedText={submission.recognizedText}
                        inputMode={inputMode}
                    />

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            New Prompt
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
