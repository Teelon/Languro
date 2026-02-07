import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/utils/prismaDB';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { WritingFeedback } from '@/components/writing/WritingFeedback';

interface Correction {
    original: string;
    corrected: string;
    errorType: 'spelling' | 'grammar' | 'vocabulary' | 'style';
    explanation: string;
    explanationNative: string;
    startIndex: number;
    endIndex: number;
}

export default async function WritingSubmissionPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const { id } = await params;

    const submission = await prisma.writingSubmission.findUnique({
        where: { id },
        include: {
            prompt: {
                include: {
                    image: true,
                    language: true
                }
            }
        }
    });

    if (!submission || submission.userId !== session.user.id) {
        notFound();
    }

    const corrections = (submission.corrections as unknown as Correction[]) || [];
    const overallFeedback = (submission.overallFeedback as { target: string; native: string }) || { target: '', native: '' };

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/writing">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Writing Practice</h1>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {submission.prompt.language.name}
                            </span>
                            <Badge variant={submission.inputType === 'handwritten' ? 'secondary' : 'outline'}>
                                {submission.inputType}
                            </Badge>
                        </div>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/writing">New Practice</Link>
                </Button>
            </div>

            {/* Image that was described */}
            <Card className="overflow-hidden">
                <div className="relative aspect-video max-h-[300px]">
                    <Image
                        src={submission.prompt.image.imageUrl}
                        alt="Writing prompt image"
                        fill
                        className="object-contain bg-muted"
                    />
                </div>
                <div className="p-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        <strong>Prompt:</strong> {submission.prompt.promptText}
                    </p>
                </div>
            </Card>

            {/* Feedback Component */}
            <WritingFeedback
                originalText={submission.originalInput || submission.recognizedText || ''}
                correctedText={submission.correctedText}
                corrections={corrections}
                overallFeedback={overallFeedback}
                score={submission.score || 0}
                recognizedText={submission.recognizedText || undefined}
                inputMode={submission.inputType as 'typed' | 'handwritten'}
            />
        </div>
    );
}
