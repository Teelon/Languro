
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MIGRATION_CONFIG } from '../config/migration-config';
import { MigrationLogger } from '../utils/logger';

const logger = new MigrationLogger();

interface VerbData {
  id: number;
  word: string;
  languageCode: string;
  languageName: string;
  conjugationCount: number;
  conceptName?: string;
  sampleConjugations: Array<{
    tense: string;
    mood: string;
    form: string;
  }>;
}

interface LLMVerbAnalysis {
  infinitive: string;
  difficulty: number;
  tags: string[];
  isIrregular: boolean;
  usageNotes: string;
  learnerChallenges: string[];
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  frequency: 'very_common' | 'common' | 'moderate' | 'rare';
}

export class GeminiVerbClassifier {
  private model: any;
  private cache: Map<string, LLMVerbAnalysis>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In a real scenario, we might want to handle this more gracefully or let it fail when called.
      // For now, checks are done in the main script too.
    }

    // Only initialize if key exists, otherwise let it error on usage if not caught upstream
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({
        model: MIGRATION_CONFIG.llm.model,
        generationConfig: {
          temperature: MIGRATION_CONFIG.llm.temperature,
          responseMimeType: 'application/json',
        }
      });
    }
    this.cache = new Map();
  }

  async classifyBatch(verbs: VerbData[]): Promise<Map<number, LLMVerbAnalysis>> {
    if (verbs.length === 0) return new Map();

    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    const languageName = verbs[0].languageName;
    const languageCode = verbs[0].languageCode;

    logger.debug(`Sending ${verbs.length} ${languageName} verbs to Gemini...`);

    const prompt = this.buildPrompt(verbs, languageName);

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      let analyses;
      try {
        analyses = JSON.parse(text);
      } catch (e) {
        // Sometimes Gemini might wrap in markdown ```json ... ```
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          analyses = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON response');
        }
      }

      if (!Array.isArray(analyses)) {
        throw new Error('Response is not an array');
      }

      const resultMap = new Map<number, LLMVerbAnalysis>();

      verbs.forEach((verb, index) => {
        const analysis = analyses[index];
        if (analysis && this.validateAnalysis(analysis)) {
          resultMap.set(verb.id, analysis);
          this.cache.set(`${languageCode}:${verb.word}`, analysis);
        }
      });

      logger.success(`✓ Classified ${resultMap.size}/${verbs.length} verbs`);
      return resultMap;

    } catch (error) {
      logger.error(`Gemini failed: ${error}`);
      return new Map();
    }
  }

  private buildPrompt(verbs: VerbData[], languageName: string): string {
    const verbList = verbs.map((v, idx) => {
      const conj = v.sampleConjugations
        .slice(0, 3)
        .map(c => `${c.tense}: ${c.form}`)
        .join(', ');
      return `${idx}. "${v.word}" - ${v.conjugationCount} forms${conj ? ` (${conj})` : ''}`;
    }).join('\n');

    return `You are a linguistics expert for ${languageName} verb analysis for language learners.

Analyze these ${verbs.length} verbs:

${verbList}

For each verb, provide:
- difficulty (1-5): 1=beginner friendly, 5=highly irregular/advanced
- tags: array like ["irregular", "very_common", "reflexive", "has_subjunctive", "ar_verb", "${languageName.toLowerCase()}"]
- isIrregular: boolean
- usageNotes: brief tip (max 150 chars)
- learnerChallenges: array of 1-3 common mistakes
- cefrLevel: "A1"|"A2"|"B1"|"B2"|"C1"|"C2"
- frequency: "very_common"|"common"|"moderate"|"rare"

Return ONLY a JSON array, one object per verb in order:

[
  {
    "infinitive": "hacer",
    "difficulty": 4,
    "tags": ["spanish", "irregular", "very_common", "action_verb"],
    "isIrregular": true,
    "usageNotes": "Essential verb 'to do/make' with irregular conjugations",
    "learnerChallenges": ["Irregular yo form: hago", "Preterite stem hic-/hiz-"],
    "cefrLevel": "A1",
    "frequency": "very_common"
  }
]`;
  }

  private validateAnalysis(a: any): boolean {
    return (
      (typeof a.infinitive === 'string' || (a.infinitive === undefined)) && // Allow partial fails safely or check mapping
      typeof a.difficulty === 'number' &&
      a.difficulty >= 1 && a.difficulty <= 5 &&
      Array.isArray(a.tags) &&
      typeof a.isIrregular === 'boolean' &&
      typeof a.usageNotes === 'string' &&
      Array.isArray(a.learnerChallenges) &&
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(a.cefrLevel) &&
      ['very_common', 'common', 'moderate', 'rare'].includes(a.frequency)
    );
  }
}
