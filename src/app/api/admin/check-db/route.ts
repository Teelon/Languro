
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

export async function GET() {
  try {
    const packs = await prisma.templatePack.count();
    const items = await prisma.templatePackItem.count();
    const contentItems = await prisma.contentItem.count();
    const drillItems = await prisma.drillItem.count();

    return NextResponse.json({
      success: true,
      counts: {
        packs,
        items,
        contentItems,
        drillItems
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
