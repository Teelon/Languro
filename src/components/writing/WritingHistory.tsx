'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface HistoryItem {
    id: string;
    createdAt: string;
    score: number | null;
    inputType: 'typed' | 'handwritten';
    imageUrl: string;
    language: string;
    previewText: string;
    correctionsCount: number;
}

export function WritingHistory() {
    const [submissions, setSubmissions] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/writing/history');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch history');
                }

                setSubmissions(data.submissions);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this practice session? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/writing/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete session');
            }

            setSubmissions(prev => prev.filter(s => s.id !== id));
            toast.success('Practice session deleted');
        } catch (err) {
            toast.error('Failed to delete session');
            console.error(err);
        }
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-muted-foreground';
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-destructive">{error}</p>
            </Card>
        );
    }

    if (submissions.length === 0) {
        return (
            <Card className="p-8 text-center border-2 border-dashed">
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">No practice sessions yet</h3>
                    <p className="text-muted-foreground">
                        Complete your first writing practice to see it here!
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {submissions.length} practice session{submissions.length !== 1 ? 's' : ''}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {submissions.map((item) => (
                    <Link key={item.id} href={`/writing/${item.id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-muted group">
                                <Image
                                    src={item.imageUrl}
                                    alt="Writing prompt"
                                    fill
                                    className="object-cover"
                                />
                                {/* Delete button */}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => handleDelete(e, item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {/* Score badge */}
                                <div className="absolute top-2 right-2">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'font-bold',
                                            getScoreColor(item.score)
                                        )}
                                    >
                                        {item.score !== null ? `${Math.round(item.score)}%` : 'N/A'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {item.inputType}
                                    </Badge>
                                </div>

                                <p className="text-sm line-clamp-2 text-muted-foreground">
                                    {item.previewText}...
                                </p>

                                <div className="flex items-center gap-2 text-xs">
                                    {item.correctionsCount === 0 ? (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-3 w-3" />
                                            Perfect!
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {item.correctionsCount} correction{item.correctionsCount !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
