import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { z } from 'zod';
import { generateDrillsForVerb } from '@/lib/drill/generator';

const addItemSchema = z.object({
  verb: z.string().min(1),
  language: z.string().length(2), // iso code e.g. 'fr'
  context: z.string().optional(),
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

    // Verify ownership
    const list = await prisma.userList.findUnique({
      where: { id: listId },
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    const items = await prisma.userListItem.findMany({
      where: { listId },
      orderBy: { addedAt: 'desc' },
      include: {
        contentItem: {
          include: {
            verbTranslation: {
              select: {
                word: true,
                concept: {
                  select: {
                    definition: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format for frontend
    const formattedItems = items.map(item => ({
      id: item.id,
      contentItemId: item.contentItemId,
      word: item.contentItem.verbTranslation?.word || 'Unknown',
      definition: item.contentItem.verbTranslation?.concept?.definition,
      addedAt: item.addedAt,
    }));

    return NextResponse.json({ success: true, items: formattedItems });

  } catch (error) {
    console.error('Error fetching list items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(
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
    const validation = addItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { verb, language, context } = validation.data;

    // Verify ownership
    const list = await prisma.userList.findUnique({
      where: { id: listId },
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    // 1. Find Language ID
    const langRecord = await prisma.language.findUnique({
      where: { iso_code: language }
    });

    if (!langRecord) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Check for language consistency
    if (langRecord.id !== list.languageId) {
      return NextResponse.json({
        error: `Language mismatch: List is configured for a different language.`,
        details: { listLanguageId: list.languageId, itemLanguageId: langRecord.id }
      }, { status: 400 });
    }

    // 2. Find or Create VerbTranslation
    // We try to find it first.
    let verbTranslation = await prisma.verbTranslation.findFirst({
      where: {
        language_id: langRecord.id,
        word: {
          equals: verb,
          mode: 'insensitive'
        }
      }
    });

    // If not found, create a basic one (or we could rely on a seed script, but better to handle user input)
    if (!verbTranslation) {
      verbTranslation = await prisma.verbTranslation.create({
        data: {
          language_id: langRecord.id,
          word: verb.toLowerCase(),
          // concept_id: null - implies we don't know the abstract concept yet
        }
      });
    }

    // 3. Find or Create ContentItem (Upsert guarantees global singleton)
    // This ensures that if User A and User B add the same verb simultaneously,
    // we only create one ContentItem and one set of Drills.
    let contentItem = await prisma.contentItem.upsert({
      where: {
        languageId_contentType_verbTranslationId: {
          languageId: langRecord.id,
          contentType: 'verb',
          verbTranslationId: verbTranslation.id
        }
      },
      update: {}, // No changes if it exists
      create: {
        languageId: langRecord.id,
        contentType: 'verb',
        verbTranslationId: verbTranslation.id,
        metadata: {
          source: 'user-list-creation'
        }
      }
    });

    // 4. Create UserListItem (prevent duplicates)
    try {
      const userListItem = await prisma.userListItem.create({
        data: {
          listId: listId,
          contentItemId: contentItem.id,
          context: context
        }
      });

      // TRIGGER DRILL GENERATION
      // We do this asynchronously (fire and forget) or await it. 
      // Awaiting is safer to ensure it works immediately for the user.
      try {
        await generateDrillsForVerb(contentItem, langRecord);
      } catch (genError) {
        console.error('Error generating drills on-the-fly:', genError);
        // We don't fail the request, just log it.
      }

      return NextResponse.json({ success: true, item: userListItem }, { status: 201 });
    } catch (e: any) {
      if (e.code === 'P2002') {
        // Unique constraint violation - already in list

        // Even if already in list, maybe it has no drills?
        // Let's try generating drills here too just in case.
        try {
          await generateDrillsForVerb(contentItem, langRecord);
        } catch (genError) {
          console.error('Error generating drills for existing item:', genError);
        }

        return NextResponse.json({ success: true, message: 'Already in list' }, { status: 200 });
      }
      throw e;
    }

  } catch (error) {
    console.error('Error adding item to list:', error);
    return NextResponse.json({ success: false, error: 'Failed to add item' }, { status: 500 });
  }
}

