import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=3600');

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}
