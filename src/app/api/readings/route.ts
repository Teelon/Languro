import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth'; // Adjust path if needed
import { ReadingService } from '@/lib/reading/service';
import { ReadingGenerator } from '@/lib/reading/generator';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get languageId from query param or user profile?
  // Ideally passed from client.
  const { searchParams } = new URL(req.url);
  const languageId = parseInt(searchParams.get('languageId') || '0');

  if (!languageId) {
    return NextResponse.json({ error: 'Language ID required' }, { status: 400 });
  }

  try {
    const readings = await ReadingService.listReadingsForUser(session.user.id, languageId);
    return NextResponse.json(readings);
  } catch (error) {
    console.error('Failed to list readings', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const languageId = body.languageId;

    if (!languageId) {
      return NextResponse.json({ error: 'Language ID required' }, { status: 400 });
    }

    const generator = new ReadingGenerator();
    const result = await generator.generateReadingForUser(session.user.id, languageId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate reading', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
