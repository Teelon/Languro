import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { z } from 'zod';

// Schema for creating a list
const createListSchema = z.object({
  name: z.string().min(1).max(50),
  languageId: z.number().int().positive(),
  description: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageIdParam = searchParams.get('languageId');

    const where: any = {
      userId: session.user.id,
      isArchived: false,
    };

    if (languageIdParam) {
      const languageId = parseInt(languageIdParam);
      if (!isNaN(languageId)) {
        where.languageId = languageId;
      }
    }

    const lists = await prisma.userList.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            iso_code: true,
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({ success: true, lists });
  } catch (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.issues }, { status: 400 });
    }

    const { name, languageId, description } = validation.data;

    // Optional: Limit number of lists per user to prevent abuse
    const count = await prisma.userList.count({
      where: { userId: session.user.id }
    });

    if (count >= 50) {
      return NextResponse.json({ success: false, error: 'List limit reached' }, { status: 403 });
    }

    const list = await prisma.userList.create({
      data: {
        userId: session.user.id,
        name,
        languageId,
        description,
      },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            iso_code: true,
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (error) {
    console.error('Error creating user list:', error);
    return NextResponse.json({ success: false, error: 'Failed to create list' }, { status: 500 });
  }
}
