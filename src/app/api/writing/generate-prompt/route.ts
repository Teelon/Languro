import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { WritingPromptGenerator } from '@/lib/writing/generator';

/**
 * POST /api/writing/generate-prompt
 * Generate a new writing prompt for the authenticated user
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user profile for language and level
        const userProfile = await prisma.userOnboardingProfile.findUnique({
            where: { userId: session.user.id },
            include: { targetLanguage: true }
        });

        if (!userProfile) {
            return NextResponse.json(
                { error: 'User profile not found. Please complete onboarding.' },
                { status: 400 }
            );
        }

        const generator = new WritingPromptGenerator();

        // Get a random image from pool matching user's level
        const image = await generator.getRandomImage(userProfile.cefrLevel);

        if (!image) {
            return NextResponse.json(
                { error: 'No images available. Please try again later.' },
                { status: 503 }
            );
        }

        // Create the prompt
        const prompt = await generator.createPrompt(
            session.user.id,
            image.id,
            userProfile.targetLanguageId,
            userProfile.targetLanguage.name
        );

        return NextResponse.json({
            success: true,
            prompt: {
                id: prompt.id,
                text: prompt.promptText,
                imageUrl: prompt.imageUrl,
                language: userProfile.targetLanguage.name,
                level: userProfile.cefrLevel
            }
        });

    } catch (error) {
        console.error('Error generating writing prompt:', error);
        return NextResponse.json(
            { error: 'Failed to generate prompt' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/writing/generate-prompt
 * Get the user's current/recent prompts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get recent prompts for the user
        const prompts = await prisma.writingPrompt.findMany({
            where: { userId: session.user.id },
            include: {
                image: true,
                language: true,
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json({
            prompts: prompts.map(p => ({
                id: p.id,
                text: p.promptText,
                imageUrl: p.image.imageUrl,
                language: p.language.name,
                createdAt: p.createdAt,
                hasSubmission: p.submissions.length > 0,
                lastScore: p.submissions[0]?.score || null
            }))
        });

    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompts' },
            { status: 500 }
        );
    }
}
