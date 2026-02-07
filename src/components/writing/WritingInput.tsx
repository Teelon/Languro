'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { HandwritingCapture } from './HandwritingCapture';

interface WritingInputProps {
    mode: 'typed' | 'handwritten';
    onSubmit: (text: string, imageFile?: File) => void;
    isLoading: boolean;
    targetLanguage: string;
}

export function WritingInput({ mode, onSubmit, isLoading, targetLanguage }: WritingInputProps) {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = () => {
        if (mode === 'typed' && text.trim()) {
            onSubmit(text.trim());
        } else if (mode === 'handwritten' && imageFile) {
            onSubmit('', imageFile);
        }
    };

    const canSubmit =
        (mode === 'typed' && text.trim().length > 0) ||
        (mode === 'handwritten' && imageFile !== null);

    return (
        <Card className="p-4 space-y-4">
            <h3 className="font-semibold">
                {mode === 'typed' ? 'Type your response' : 'Upload your handwriting'}
            </h3>

            {mode === 'typed' ? (
                <div className="space-y-2">
                    <Textarea
                        placeholder={`Write your description in ${targetLanguage}...`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        className="resize-none"
                        data-testid="writing-input"
                    />
                    <p className="text-xs text-muted-foreground">
                        {text.length} characters
                    </p>
                </div>
            ) : (
                <HandwritingCapture
                    onCapture={setImageFile}
                    currentFile={imageFile}
                />
            )}

            <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className="w-full"
                data-testid="submit-btn"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                    </>
                )}
            </Button>
        </Card>
    );
}
