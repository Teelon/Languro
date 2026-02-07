import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

/**
 * POST /api/writing/session/create
 * Creates a new handwriting session for QR code mobile upload
 */
export async function POST() {
    try {
        const session = await prisma.handwritingSession.create({
            data: {
                // Set expiration to 15 minutes from now
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                status: 'pending'
            }
        });

        return NextResponse.json({
            sessionId: session.id,
            expiresAt: session.expiresAt
        });
    } catch (error) {
        console.error('Error creating handwriting session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}
