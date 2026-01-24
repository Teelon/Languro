import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Find mastery records that are due (nextReviewAt <= now)
  const due = await prisma.mastery.findMany({
    where: {
      userId: session.user.id,
      nextReviewAt: { lte: now },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 50,
    include: {
      drillItem: {
        include: {
          contentItem: true
        }
      }
    }
  });

  return NextResponse.json({
    count: due.length,
    due: due.map(m => ({
      masteryId: m.id,
      drillItemId: m.drillItemId,
      nextReviewAt: m.nextReviewAt,
      verb: (m.drillItem.contentItem.data as any).infinitive,
      streak: m.correctStreak
    }))
  });
}
