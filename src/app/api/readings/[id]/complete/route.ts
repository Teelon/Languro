import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { ReadingService } from '@/lib/reading/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await ReadingService.completeReading(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to complete reading', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
