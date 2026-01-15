import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Supported audio types
const AUDIO_TYPES = ['conjugation', 'reading', 'listening', 'lesson'] as const;
type AudioType = typeof AUDIO_TYPES[number];

// Helper to clean parameters (lowercase, handle slashes, spaces to underscores)
function cleanParam(param: string): string {
  return param.toLowerCase().split('/')[0].trim().replace(/\s+/g, '_');
}

// Build R2 key based on audio type
function buildAudioKey(type: AudioType, params: Record<string, string>): string {
  switch (type) {
    case 'conjugation':
      // conjugation/es/hablar/presente/yo_hablo.opus
      const { language, verb, tense, pronoun, conjugated } = params;
      if (!language || !verb || !tense || !pronoun || !conjugated) {
        throw new Error('Missing required parameters for conjugation');
      }

      const cleanLang = cleanParam(language);
      const cleanVerb = cleanParam(verb);
      const cleanTense = cleanParam(tense);
      const cleanPronoun = cleanParam(pronoun);
      const cleanConjugated = cleanParam(conjugated);

      return `conjugation/${cleanLang}/${cleanVerb}/${cleanTense}/${cleanPronoun}_${cleanConjugated}.opus`;

    case 'reading':
      // reading/es/beginner/lesson-1.opus
      const { language: readLang, level, filename } = params;
      if (!readLang || !level || !filename) {
        throw new Error('Missing required parameters for reading');
      }
      return `reading/${cleanParam(readLang)}/${cleanParam(level)}/${cleanParam(filename)}.opus`;

    case 'listening':
      // listening/es/dialog-1.opus
      const { language: listenLang, filename: listenFile } = params;
      if (!listenLang || !listenFile) {
        throw new Error('Missing required parameters for listening');
      }
      return `listening/${cleanParam(listenLang)}/${cleanParam(listenFile)}.opus`;

    case 'lesson':
      // lessons/es/grammar/ser-vs-estar.opus
      const { language: lessonLang, category, filename: lessonFile } = params;
      if (!lessonLang || !category || !lessonFile) {
        throw new Error('Missing required parameters for lesson');
      }
      return `lessons/${cleanParam(lessonLang)}/${cleanParam(category)}/${cleanParam(lessonFile)}.opus`;

    default:
      throw new Error(`Unsupported audio type: ${type}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get audio type (required)
    const type = searchParams.get('type') as AudioType;

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: type',
          validTypes: AUDIO_TYPES,
        },
        { status: 400 }
      );
    }

    if (!AUDIO_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type: ${type}`,
          validTypes: AUDIO_TYPES,
        },
        { status: 400 }
      );
    }

    // Collect all other params
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'type') {
        params[key] = value;
      }
    });

    // Build R2 key based on type
    const key = buildAudioKey(type, params);

    console.log(`[Audio API] Type: ${type}, Key: ${key}`);

    // Generate signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 1800, // 30 minutes
    });

    console.log('[Audio API] Successfully generated signed URL');

    return NextResponse.json({
      success: true,
      type,
      url: signedUrl,
      key,
      expiresIn: 1800,
    });

  } catch (error: any) {
    console.error('[Audio API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate audio URL',
      },
      { status: 500 }
    );
  }
}
