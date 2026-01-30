import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string; itemId: string }> }
) {
  try {
    const { listId, itemId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify list ownership
    const list = await prisma.userList.findUnique({
      where: { id: listId },
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    // Verify item belongs to list
    const item = await prisma.userListItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.listId !== listId) {
      return NextResponse.json({ error: 'Item not found in this list' }, { status: 404 });
    }

    await prisma.userListItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
