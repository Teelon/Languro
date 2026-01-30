import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      select: {
        id: true,
        name: true,
        iso_code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ success: true, languages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
