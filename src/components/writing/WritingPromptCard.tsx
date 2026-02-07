'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface WritingPromptCardProps {
    imageUrl: string;
    promptText: string;
    language: string;
}

export function WritingPromptCard({ imageUrl, promptText, language }: WritingPromptCardProps) {
    return (
        <Card className="overflow-hidden">
            {/* Image */}
            <div className="relative aspect-video bg-muted">
                <Image
                    src={imageUrl}
                    alt="Writing prompt image"
                    fill
                    className="object-cover"
                    data-testid="prompt-image"
                />
            </div>

            {/* Prompt Text */}
            <div className="p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                    Your task ({language}):
                </p>
                <p className="text-lg">
                    {promptText}
                </p>
            </div>
        </Card>
    );
}
