import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
 * GET /api/writing/session/[id]
 * Checks the status of a handwriting session
 * Used by the desktop client to poll for upload completion
 */
export async function GET(
    request: NextRequest,
    params: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic params
) {
    try {
        const { id } = await params.params;

        if (!id) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = await prisma.handwritingSession.findUnique({
            where: { id }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Check if session has expired
        if (new Date() > session.expiresAt) {
            return NextResponse.json(
                { error: 'Session expired' },
                { status: 410 }
            );
        }

        let signedUrl = session.imageUrl;
        if (session.imageKey) {
            try {
                const command = new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_WRITING_NAME,
                    Key: session.imageKey,
                });
                signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            } catch (err) {
                console.error('Error generating signed URL:', err);
                // Fallback to stored URL if signing fails
            }
        }

        return NextResponse.json({
            status: session.status,
            imageUrl: signedUrl,
            imageKey: session.imageKey
        });

    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}
