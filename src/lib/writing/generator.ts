import { GoogleGenerativeAI } from '@google/generative-ai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/utils/prismaDB';

/**
 * Initialize S3 Client for Cloudflare R2 storage
 */
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

/**
 * WritingPromptGenerator - Generates and manages writing prompts
 * Uses shared image pool to reduce API costs
 */
export class WritingPromptGenerator {
    private genAI: GoogleGenerativeAI;
    private db: PrismaClient;
    private modelName: string;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.db = prisma;
        this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    }

    /**
     * Get a random image from the shared pool matching the user's level
     */
    async getRandomImage(difficulty: string): Promise<{
        id: string;
        imageUrl: string;
        description: string | null;
    } | null> {
        // Try to find an active image at the user's level
        const images = await this.db.writingImage.findMany({
            where: {
                difficulty,
                isActive: true
            },
            select: {
                id: true,
                imageUrl: true,
                description: true
            }
        });

        if (images.length === 0) {
            // Fall back to any active image
            const anyImages = await this.db.writingImage.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    imageUrl: true,
                    description: true
                },
                take: 10
            });

            if (anyImages.length === 0) return null;
            return anyImages[Math.floor(Math.random() * anyImages.length)];
        }

        return images[Math.floor(Math.random() * images.length)];
    }

    /**
     * Increment usage count when an image is used
     */
    async incrementUsageCount(imageId: string): Promise<void> {
        await this.db.writingImage.update({
            where: { id: imageId },
            data: { usageCount: { increment: 1 } }
        });
    }

    /**
     * Generate a new image using Gemini and upload to R2
     * This is used by the Airflow DAG for background generation
     */
    async generateImage(difficulty: string, topic?: string): Promise<{
        imageUrl: string;
        imageKey: string;
        description: string;
    }> {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        // First, generate a description of what image to create
        const descPrompt = `Generate a brief description (1-2 sentences) for an image that would be good for a ${difficulty} level language learner to describe. 
${topic ? `Topic: ${topic}` : 'Choose an everyday scene or object.'}
Make it appropriately complex for the level:
- A1/A2: Simple objects, basic scenes (a cat on a table, a red apple)
- B1/B2: More complex scenes (a busy market, people in a park)
- C1/C2: Abstract or nuanced scenes (a contemplative landscape, an artistic composition)
Output only the description, nothing else.`;

        const descResult = await model.generateContent(descPrompt);
        const description = descResult.response.text().trim();

        // Generate the image using Gemini's native image generation
        // Note: Using the model that supports image generation
        const imageModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const imagePrompt = `Generate a clear, simple image of: ${description}
The image should be good for language learning - clear subjects, no text overlays.`;

        const imageResult = await imageModel.generateContent(imagePrompt);

        // Check if image was generated
        const response = imageResult.response;
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) {
            throw new Error('No image generated');
        }

        // Extract image data from response
        const parts = candidates[0].content?.parts;
        if (!parts) {
            throw new Error('No image parts in response');
        }

        let imageData: Buffer | null = null;
        for (const part of parts) {
            if ('inlineData' in part && part.inlineData) {
                imageData = Buffer.from(part.inlineData.data, 'base64');
                break;
            }
        }

        if (!imageData) {
            throw new Error('No image data found in response');
        }

        // Upload to R2
        const imageKey = `writing-images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_WRITING_NAME,
            Key: imageKey,
            Body: imageData,
            ContentType: 'image/png'
        }));

        const imageUrl = `${process.env.R2_PUBLIC_URL}/${imageKey}`;

        return { imageUrl, imageKey, description };
    }

    /**
     * Create a writing prompt for a user
     */
    async createPrompt(
        userId: string,
        imageId: string,
        languageId: number,
        targetLanguageName: string
    ): Promise<{
        id: string;
        promptText: string;
        imageUrl: string;
    }> {
        // Get the image
        const image = await this.db.writingImage.findUnique({
            where: { id: imageId }
        });

        if (!image) throw new Error('Image not found');

        // Create dynamic prompt text
        const promptText = `Look at the image and describe what you see in ${targetLanguageName}. Write at least 2-3 sentences.`;

        // Create the prompt record
        const prompt = await this.db.writingPrompt.create({
            data: {
                userId,
                imageId,
                languageId,
                promptText
            },
            include: {
                image: true
            }
        });

        // Increment usage counter
        await this.incrementUsageCount(imageId);

        return {
            id: prompt.id,
            promptText: prompt.promptText,
            imageUrl: prompt.image.imageUrl
        };
    }

    /**
     * Upload a handwritten image to R2
     */
    async uploadHandwritingImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
        const extension = mimeType.includes('png') ? 'png' : 'jpg';
        const key = `handwriting/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_WRITING_NAME,
            Key: key,
            Body: imageBuffer,
            ContentType: mimeType
        }));

        return key;
    }
}
