import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

/**
 * GET /api/writing/[id]
 * Get a specific writing submission by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({
            submission: {
                id: submission.id,
                createdAt: submission.createdAt,
                inputType: submission.inputType,
                originalInput: submission.originalInput,
                recognizedText: submission.recognizedText,
                correctedText: submission.correctedText,
                corrections: submission.corrections,
                overallFeedback: submission.overallFeedback,
                score: submission.score,
                prompt: {
                    text: submission.prompt.promptText,
                    imageUrl: submission.prompt.image.imageUrl,
                    language: submission.prompt.language.name
                }
            }
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
    }
}

/**
 * DELETE /api/writing/[id]
 * Delete a specific writing submission
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const submission = await prisma.writingSubmission.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!submission || submission.userId !== session.user.id) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Delete the submission
        await prisma.writingSubmission.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting submission:', error);
        return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
    }
}
