import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Correction object representing a single error and its fix
 */
export interface Correction {
    original: string;
    corrected: string;
    errorType: 'spelling' | 'grammar' | 'vocabulary' | 'style';
    explanation: string;        // In target language
    explanationNative: string;  // In native language
    startIndex: number;
    endIndex: number;
}

/**
 * Result from analyzing a writing submission
 */
export interface AnalysisResult {
    correctedText: string;
    corrections: Correction[];
    overallFeedback: {
        target: string;   // Feedback in target language
        native: string;   // Feedback in native language
    };
    score: number;      // 0-100 accuracy score
    recognizedText?: string; // Only for handwritten input
}

/**
 * WritingAnalyzer - Analyzes user writing using Gemini
 * Supports both typed text and handwritten image input
 */
export class WritingAnalyzer {
    private genAI: GoogleGenerativeAI;
    private modelName: string;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    }

    /**
     * Extract text from a handwritten image using Gemini vision
     */
    async recognizeHandwriting(imageBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: this.modelName });

        const prompt = `You are an expert handwriting recognition system. 
Extract the text from this handwritten image exactly as written.
Only output the recognized text, nothing else.
If you cannot read any part, indicate it with [unclear].`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType
                }
            }
        ]);

        return result.response.text().trim();
    }

    /**
     * Analyze writing and provide corrections with bilingual explanations
     */
    async analyzeWriting(
        text: string,
        targetLanguage: string,
        nativeLanguage: string,
        cefrLevel: string
    ): Promise<AnalysisResult> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: { responseMimeType: 'application/json' }
        });

        // Build level-appropriate prompt
        const levelGuidance = this.getLevelGuidance(cefrLevel);

        const prompt = `You are a ${targetLanguage} language teacher for a ${cefrLevel} student (native: ${nativeLanguage}).

Task: The student was asked to describe an image.

${levelGuidance}

Student's writing:
"""
${text}
"""

Analyze and correct their ${targetLanguage} writing. Return JSON:
{
  "correctedText": "corrected version",
  "score": <0-100>,
  "corrections": [
    {
      "original": "wrong text",
      "corrected": "correct text",
      "errorType": "spelling|grammar|vocabulary|style",
      "explanation": "why in ${targetLanguage}",
      "explanationNative": "why in ${nativeLanguage}",
      "startIndex": <number>,
      "endIndex": <number>
    }
  ],
  "overallFeedback": {
    "target": "feedback in ${targetLanguage}",
    "native": "feedback in ${nativeLanguage}"
  }
}

Rules:
- Focus on language corrections only
- Keep explanations ${cefrLevel}-appropriate
- Empty corrections array if perfect (score 100)`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        try {
            const parsed = JSON.parse(responseText);
            const corrections = this.validateCorrections(text, parsed.corrections || []);

            return {
                correctedText: parsed.correctedText || text,
                corrections,
                overallFeedback: parsed.overallFeedback || { target: '', native: '' },
                score: parsed.score ?? 100
            };
        } catch (e) {
            console.error('Failed to parse Gemini response:', responseText);
            // Return a safe fallback
            return {
                correctedText: text,
                corrections: [],
                overallFeedback: {
                    target: 'Unable to analyze at this time.',
                    native: 'Unable to analyze at this time.'
                },
                score: 0
            };
        }
    }

    /**
     * Validate and fix correction indices
     * AI sometimes gets indices wrong or off by a few characters
     */
    private validateCorrections(text: string, corrections: Correction[]): Correction[] {
        return corrections.map(c => {
            // 1. Check if the provided indices are exact
            const actualSubstring = text.slice(c.startIndex, c.endIndex);
            if (actualSubstring === c.original) {
                return c;
            }

            // 2. If not, try to find the text near the provided index
            // Check +/- 10 characters first
            const searchStart = Math.max(0, c.startIndex - 10);
            const searchEnd = Math.min(text.length, c.endIndex + 10);
            const nearText = text.slice(searchStart, searchEnd);
            const nearIndex = nearText.indexOf(c.original);

            if (nearIndex !== -1) {
                return {
                    ...c,
                    startIndex: searchStart + nearIndex,
                    endIndex: searchStart + nearIndex + c.original.length
                };
            }

            // 3. Fallback: Find first occurrence in the whole text (risky if repeated, but better than broken)
            const globalIndex = text.indexOf(c.original);
            if (globalIndex !== -1) {
                return {
                    ...c,
                    startIndex: globalIndex,
                    endIndex: globalIndex + c.original.length
                };
            }

            // 4. If exact match fails, try case-insensitive search
            const lowerText = text.toLowerCase();
            const lowerOriginal = c.original.toLowerCase();
            const lowerIndex = lowerText.indexOf(lowerOriginal);

            if (lowerIndex !== -1) {
                return {
                    ...c,
                    startIndex: lowerIndex,
                    endIndex: lowerIndex + c.original.length
                };
            }

            // 5. If we really can't find it, mark it as invalid (indices -1)
            // The frontend should filter these out or handle them gracefully
            return {
                ...c,
                startIndex: -1,
                endIndex: -1
            };
        }).filter(c => c.startIndex !== -1).sort((a, b) => a.startIndex - b.startIndex);
    }

    /**
     * Get level-appropriate guidance for the prompt
     */
    private getLevelGuidance(level: string): string {
        switch (level.toUpperCase()) {
            case 'A1':
            case 'A2':
                return `For this beginner student:
- Focus only on basic spelling and simple grammar errors
- Use simple vocabulary in explanations
- Be very encouraging
- Don't correct style issues, only clear mistakes`;

            case 'B1':
            case 'B2':
                return `For this intermediate student:
- Correct grammar and vocabulary errors
- Suggest better word choices when appropriate
- Explain grammar rules briefly
- Note any awkward phrasing`;

            case 'C1':
            case 'C2':
                return `For this advanced student:
- Provide nuanced feedback on style and tone
- Suggest idiomatic expressions where appropriate
- Correct subtle grammar issues
- Comment on naturalness and fluency`;

            default:
                return 'Provide balanced feedback appropriate for an intermediate learner.';
        }
    }
}
