import { prisma } from '@/utils/prismaDB';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export class ReadingService {

  static async getReading(id: string, userId: string) {
    // Fetch lesson with progress
    const reading = await prisma.readingLesson.findUnique({
      where: { id },
      include: {
        contentItem: true,
        progress: {
          where: { userId }
        }
      }
    });

    if (!reading) return null;

    // Generate Signed URL for Audio
    let audioUrl: string | null = null;
    if (reading.audioKey) {
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: reading.audioKey,
        });
        audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (e) {
        console.error("Failed to sign audio URL", e);
      }
    }

    return {
      ...reading,
      audioUrl,
      userProgress: reading.progress[0] || null
    };
  }

  static async completeReading(userId: string, readingLessonId: string) {
    return await prisma.readingProgress.upsert({
      where: {
        userId_readingLessonId: {
          userId,
          readingLessonId
        }
      },
      create: {
        userId,
        readingLessonId,
        status: 'completed',
        completedAt: new Date()
      },
      update: {
        status: 'completed',
        completedAt: new Date()
      }
    });
  }

  static async listReadingsForUser(userId: string, languageId: number) {
    return await prisma.readingLesson.findMany({
      where: {
        contentItem: { languageId }
      },
      include: {
        progress: {
          where: { userId }
        }
      },
      orderBy: {
        // Show new/started first? Or just created?
        // Let's sort by difficulty then title for now
        difficulty: 'asc'
      }
    });
  }
}
