import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export interface AlignmentPoint {
  wordIndex: number; // Index of the word in the original text (0-based)
  word: string;      // The actual word
  start: number;     // Start time in seconds
  end: number;       // End time in seconds
}

export interface AudioResult {
  audio: Buffer;
  alignment: AlignmentPoint[];
  duration: number; // in seconds
}

export interface TTSOptions {
  languageCode: string; // e.g., 'en-US', 'es-ES'
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  voiceName?: string;   // specific voice name
  speakingRate?: number; // 0.25 to 4.0
}

export interface TextToSpeechProvider {
  generateAudio(text: string, options: TTSOptions): Promise<AudioResult>;
}

export class GoogleTTSProvider implements TextToSpeechProvider {
  private client: TextToSpeechClient;

  constructor() {
    this.client = new TextToSpeechClient();
  }

  async generateAudio(text: string, options: TTSOptions): Promise<AudioResult> {
    // 1. Inject SSML marks for alignment
    const { ssml, words } = this.injectSSMLMarks(text);

    // 2. Call Google Cloud TTS API
    const [response] = await this.client.synthesizeSpeech({
      input: { ssml },
      voice: {
        languageCode: options.languageCode,
        ssmlGender: options.gender || 'NEUTRAL',
        name: options.voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: options.speakingRate || 1.0,
      },
      enableTimePointing: ['SSML_MARK'] as any, // Type cast if necessary
    });

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // 3. Process Audio Content
    const audioBuffer = Buffer.from(response.audioContent);

    // 4. Process Alignment Timepoints
    // response.timepoints = [{ markName: "word_0", timeSeconds: 0.1 }, ...]
    const alignment: AlignmentPoint[] = [];
    const timepoints = response.timepoints || [];

    // Provide a rough estimate of duration from the last timepoint if not provided
    // or calculate from buffer size / bitrate if needed, but last timepoint is good enough proxy for now
    let duration = 0;
    if (timepoints.length > 0) {
      duration = timepoints[timepoints.length - 1].timeSeconds || 0;
      // Add a small buffer for the last word
      duration += 0.5;
    }

    // Map mark names back to words
    // <mark name="word_0"/>Hello <mark name="word_1"/>World
    // Timestamps mark the START of the word.
    // End time is roughly the start of the next word.

    // Sort timepoints just in case
    timepoints.sort((a, b) => (a.timeSeconds || 0) - (b.timeSeconds || 0));

    for (let i = 0; i < timepoints.length; i++) {
      const point = timepoints[i];
      if (!point.markName?.startsWith('word_')) continue;

      const indexStr = point.markName.split('_')[1];
      const index = parseInt(indexStr, 10);

      if (isNaN(index) || index < 0 || index >= words.length) continue;

      const startTime = point.timeSeconds || 0;

      // Determine end time: start of next valid word, or end of audio
      let endTime = duration;
      // Find next word's start time
      for (let j = i + 1; j < timepoints.length; j++) {
        if (timepoints[j].markName?.startsWith('word_')) {
          endTime = timepoints[j].timeSeconds || duration;
          break;
        }
      }

      alignment.push({
        wordIndex: index,
        word: words[index],
        start: startTime,
        end: endTime
      });
    }

    return {
      audio: audioBuffer,
      alignment,
      duration
    };
  }

  private injectSSMLMarks(text: string): { ssml: string; words: string[] } {
    // Simple splitting by spaces/punctuation for demonstration.
    // A robust implementation might use a tokenizer or regex that preserves punctuation.
    // For TTS alignment, we generally want to tag "speakable" tokens.

    // Strategy: Split by whitespace, wrap non-empty tokens.
    // We need to escape XML characters in the text as well.
    // regex to find words: \b\w+\b ?
    // Or just simple split. Let's do a simple split for now but preserve structure
    // Actually, Google TTS example shows marks *between* words.
    // <speak><mark name='word1'/>The <mark name='word2'/>quick...</speak>

    // Let's refine the tokenization.
    // We want to wrap "meaningful" words.
    // Or just wrap everything separated by space.

    const words: string[] = [];
    let ssml = '<speak>';

    // Split by whitespace
    const tokens = text.split(/(\s+)/);

    let wordIndex = 0;

    for (const token of tokens) {
      // XML Escape the token
      const escapedToken = this.escapeXml(token);

      // If it's whitespace, just append
      if (/^\s+$/.test(token)) {
        ssml += escapedToken;
      } else if (token.length > 0) {
        // It's a word
        ssml += `<mark name="word_${wordIndex}"/>${escapedToken}`;
        words.push(token);
        wordIndex++;
      }
    }

    ssml += '</speak>';

    return { ssml, words };
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
      return c;
    });
  }
}
