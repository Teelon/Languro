import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { WritingAnalyzer } from '@/lib/writing/analyzer';
import { WritingPromptGenerator } from '@/lib/writing/generator';

/**
 * POST /api/writing/analyze
 * Analyze a user's writing submission
 * Supports both typed text and handwritten image uploads
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

        // Parse form data (supports both JSON and multipart)
        const contentType = request.headers.get('content-type') || '';

        let promptId: string;
        let inputType: 'typed' | 'handwritten';
        let text: string | null = null;
        let imageBuffer: Buffer | null = null;
        let imageMimeType: string = 'image/jpeg';

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload (handwritten)
            const formData = await request.formData();
            promptId = formData.get('promptId') as string;
            inputType = (formData.get('inputType') as string) === 'handwritten' ? 'handwritten' : 'typed';
            text = formData.get('text') as string | null;

            const file = formData.get('image') as File | null;
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
                imageMimeType = file.type || 'image/jpeg';
            }
        } else {
            // Handle JSON (typed)
            const body = await request.json();
            promptId = body.promptId;
            inputType = body.inputType || 'typed';
            text = body.text;
        }

        if (!promptId) {
            return NextResponse.json(
                { error: 'Prompt ID is required' },
                { status: 400 }
            );
        }

        // Verify the prompt exists and belongs to the user
        const prompt = await prisma.writingPrompt.findUnique({
            where: { id: promptId },
            include: {
                image: true,
                language: true,
                user: {
                    include: {
                        onboardingProfile: {
                            include: { nativeLanguage: true }
                        }
                    }
                }
            }
        });

        if (!prompt || prompt.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Prompt not found' },
                { status: 404 }
            );
        }

        const userProfile = prompt.user.onboardingProfile;
        if (!userProfile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 400 }
            );
        }

        const analyzer = new WritingAnalyzer();
        const generator = new WritingPromptGenerator();

        let recognizedText: string | undefined;
        let handwritingKey: string | undefined;
        let textToAnalyze: string;

        if (inputType === 'handwritten' && imageBuffer) {
            // Upload the handwriting image to R2
            handwritingKey = await generator.uploadHandwritingImage(imageBuffer, imageMimeType);

            // Recognize text from handwriting
            recognizedText = await analyzer.recognizeHandwriting(imageBuffer, imageMimeType);
            textToAnalyze = recognizedText;
        } else if (text) {
            textToAnalyze = text;
        } else {
            return NextResponse.json(
                { error: 'Text or image is required' },
                { status: 400 }
            );
        }

        // Analyze the writing - focus on language corrections only
        const analysis = await analyzer.analyzeWriting(
            textToAnalyze,
            prompt.language.name,
            userProfile.nativeLanguage.name,
            userProfile.cefrLevel
        );

        // Save the submission
        const submission = await prisma.writingSubmission.create({
            data: {
                promptId,
                userId: session.user.id,
                inputType,
                originalInput: inputType === 'typed' ? text : null,
                handwritingKey,
                recognizedText,
                correctedText: analysis.correctedText,
                corrections: analysis.corrections as unknown as object,
                overallFeedback: analysis.overallFeedback as unknown as object,
                score: analysis.score
            }
        });

        return NextResponse.json({
            success: true,
            submission: {
                id: submission.id,
                inputType: submission.inputType,
                originalText: inputType === 'handwritten' ? recognizedText : text,
                recognizedText: recognizedText,
                correctedText: analysis.correctedText,
                corrections: analysis.corrections,
                overallFeedback: analysis.overallFeedback,
                score: analysis.score
            }
        });

    } catch (error) {
        console.error('Error analyzing writing:', error);
        return NextResponse.json(
            { error: 'Failed to analyze writing' },
            { status: 500 }
        );
    }
}
