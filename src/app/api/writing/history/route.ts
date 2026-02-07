import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

/**
 * GET /api/writing/history
 * Get user's writing submission history
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const submissions = await prisma.writingSubmission.findMany({
            where: { userId: session.user.id },
            include: {
                prompt: {
                    include: {
                        image: true,
                        language: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to 50 most recent
        });

        return NextResponse.json({
            submissions: submissions.map(s => ({
                id: s.id,
                createdAt: s.createdAt,
                score: s.score,
                inputType: s.inputType,
                imageUrl: s.prompt.image.imageUrl,
                language: s.prompt.language.name,
                previewText: s.correctedText?.substring(0, 100) || s.originalInput?.substring(0, 100) || '',
                correctionsCount: Array.isArray(s.corrections) ? (s.corrections as unknown[]).length : 0
            }))
        });
    } catch (error) {
        console.error('Error fetching writing history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
