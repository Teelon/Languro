import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback } from '@/features/conjugator/services/db';
import crypto from 'crypto';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conjugationId, voteType, reason } = body;

        if (!conjugationId || !voteType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get User Session
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id; // Assuming session.user has id (customized in authOptions)

        // Simple fingerprinting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const fingerprint = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');

        const result = await submitFeedback(conjugationId, voteType, reason, fingerprint, userId);

        if (!result.success) {
            // Usually 409 Conflict if duplicate vote, but we'll return 400 with message for simplicity
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
