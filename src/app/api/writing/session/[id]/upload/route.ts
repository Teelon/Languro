import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Initialize S3 Client for Cloudflare R2 storage
 * Reuse the same configuration as in generator.ts
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
 * POST /api/writing/session/[id]/upload
 * Uploads an image to an active handwriting session
 * Used by the mobile client
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Validate session
        const session = await prisma.handwritingSession.findUnique({
            where: { id }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        if (new Date() > session.expiresAt) {
            return NextResponse.json(
                { error: 'Session expired' },
                { status: 410 }
            );
        }

        if (session.status !== 'pending') {
            return NextResponse.json(
                { error: 'Session already completed' },
                { status: 400 }
            );
        }

        // 2. Process file upload
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // 3. Upload to R2
        const mimeType = file.type || 'image/jpeg';
        // Simple extension extraction
        const extension = mimeType.split('/')[1] || 'jpg';
        const key = `handwriting-sessions/${id}-${Date.now()}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_WRITING_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimeType
        }));

        const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        // 4. Update session
        await prisma.handwritingSession.update({
            where: { id },
            data: {
                status: 'uploaded',
                imageUrl,
                imageKey: key
            }
        });

        return NextResponse.json({
            success: true,
            imageUrl
        });

    } catch (error) {
        console.error('Error uploading to session:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
