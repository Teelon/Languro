import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { z } from 'zod';

const updateListSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await prisma.userList.findUnique({
      where: { id: listId },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            iso_code: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch list' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const existingList = await prisma.userList.findUnique({
      where: { id: listId },
    });

    if (!existingList || existingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    const updatedList = await prisma.userList.update({
      where: { id: listId },
      data: validation.data,
    });

    return NextResponse.json({ success: true, list: updatedList });
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ success: false, error: 'Failed to update list' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingList = await prisma.userList.findUnique({
      where: { id: listId },
    });

    if (!existingList || existingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    // Determine if we should soft delete (archive) or hard delete.
    // For now, let's hard delete if empty, or soft delete?
    // User schema has "isArchived", so let's use that preferentially?
    // Actually, deleting usually means user wants it gone. 
    // Let's destroy it.
    await prisma.userList.delete({
      where: { id: listId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete list' }, { status: 500 });
  }
}
