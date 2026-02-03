import { GoogleGenerativeAI } from '@google/generative-ai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { GoogleTTSProvider, TextToSpeechProvider } from './tts-provider';
import { prisma } from '@/utils/prismaDB';

// Initialize S3 Client (R2)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export class ReadingGenerator {
  private genAI: GoogleGenerativeAI;
  private ttsProvider: TextToSpeechProvider;
  private db: PrismaClient;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.ttsProvider = new GoogleTTSProvider();
    this.db = prisma;
  }

  /**
   * Generates a personalized reading lesson for a user.
   */
  async generateReadingForUser(userId: string, languageId: number) {
    // 1. Fetch User Profile & Vocabulary
    const userProfile = await this.db.userOnboardingProfile.findUnique({
      where: { userId },
      include: { targetLanguage: true }
    });

    if (!userProfile) throw new Error('User profile not found');
    const langCode = userProfile.targetLanguage.iso_code;
    const level = userProfile.cefrLevel || 'A1';
    const interests = userProfile.interests.join(', ') || 'general topics';

    // 2. Select Target Vocabulary (1 Verb, 2 Other)
    // Simple random selection for now. In future, use SRS due items.
    // Fetch 1 random verb
    const verb = await this.getRandomWord(languageId, 'verb');
    // Fetch 2 random other words (nouns/adjectives from vocab or other verbs)
    const other1 = await this.getRandomWord(languageId, 'vocab');
    const other2 = await this.getRandomWord(languageId, 'vocab');

    const targetWords = [verb, other1, other2].filter(Boolean) as string[];

    // 3. Generate Text with Gemini
    const { title, content, VocabularyUsed } = await this.generateText(
      level,
      interests,
      targetWords,
      userProfile.targetLanguage.name
    );

    // 4. Generate Audio & Alignment
    // const audioResult = await this.ttsProvider.generateAudio(content, {
    //   languageCode: this.mapLanguageCode(langCode),
    //   gender: 'NEUTRAL',
    //   voiceName: this.getVoiceName(langCode)
    // });

    // 5. Upload Audio to R2
    // const audioKey = `reading/${langCode}/${level}/${Date.now()}-${title.replace(/\s+/g, '_').toLowerCase()}.mp3`;

    // await s3Client.send(new PutObjectCommand({
    //   Bucket: process.env.R2_BUCKET_NAME!,
    //   Key: audioKey,
    //   Body: audioResult.audio,
    //   ContentType: 'audio/mpeg'
    // }));
    console.log(`[ReadingGenerator] Audio generation skipped (Text-only mode)`);

    // 6. Save to Database
    const contentItem = await this.db.contentItem.create({
      data: {
        languageId,
        contentType: 'reading',
        // We can store semantic data in JSON if needed, but we use the relation mainly
        data: {
          targetVocabulary: targetWords
        },
        metadata: {
          generatedBy: process.env.GEMINI_TRANSLATION_MODEL || 'gemini-2.0-flash-exp',
          createdAt: new Date()
        },
        readingLesson: {
          create: {
            title,
            content,
            difficulty: level,
            audioKey: null, // audioKey,
            alignment: undefined, // audioResult.alignment as any // Prisma Json
          }
        },
        // Create initial progress for user

      },
      include: {
        readingLesson: true
      }
    });

    // Actually, I defined ReadingProgress relative to ReadingLesson in schema.
    // So I need to update it to link correctly.
    // Let's do it in a transaction or separate call if nested create is tricky.
    // But nested create `readingLesson: { create: { ... progress: { create: ... } } }` works.

    // Wait, `ReadingProgress` has `userId` and `readingLessonId`.
    // I can do:
    await this.db.readingProgress.create({
      data: {
        userId,
        readingLessonId: contentItem.readingLesson!.id,
        status: 'new'
      }
    });

    return contentItem;
  }

  private async getRandomWord(languageId: number, type: 'verb' | 'vocab'): Promise<string | null> {
    // Basic random fetch.
    if (type === 'verb') {
      const count = await this.db.verbTranslation.count({ where: { language_id: languageId } });
      const skip = Math.floor(Math.random() * count);
      const res = await this.db.verbTranslation.findMany({
        where: { language_id: languageId },
        take: 1,
        skip
      });
      return res[0]?.word || null;
    } else {
      // Try to find vocab content items? Or just more verbs for now as placeholder
      // Since we don't have a big vocab dictionary yet, reuse verbs or just hardcode/skip
      return null;
    }
  }

  private async generateText(level: string, interests: string, targetWords: string[], language: string) {
    const prompt = `
      Write a short reading lesson (approx 150 words) for a ${language} learner at ${level} level.
      Topic: ${interests}.
      
      You must include the following target vocabulary words in the story context:
      ${targetWords.join(', ')}
      
      Output ONLY valid JSON with this structure:
      {
        "title": "Story Title",
        "content": "The full story text in ${language}. Do not include translations."
      }
    `;

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    const model = this.genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse LLM response", text);
      throw new Error("Invalid LLM response");
    }
  }

  private mapLanguageCode(iso: string): string {
    const map: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT'
    };
    return map[iso] || 'en-US';
  }

  private getVoiceName(iso: string): string | undefined {
    // Return undefined to let Google pick standard Neural2 for the language
    return undefined;
  }
}
