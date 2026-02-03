export type ContentType = 'verb' | 'vocab' | 'phrase' | 'grammar_rule' | 'reading';

export interface BaseContentData {
  // Common fields if any
}

export interface VerbContentData extends BaseContentData {
  verbTranslationId: number; // Reference to existing VerbTranslation
}

export interface VocabContentData extends BaseContentData {
  word: string;
  translation: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface PhraseContentData extends BaseContentData {
  phrase: string;
  translation: string;
  context?: string;
}

export interface ReadingContentData extends BaseContentData {
  // Most data is in the separate ReadingLesson model, but we might store summary here or empty
  title?: string;
  summary?: string;
}

export interface GrammarRuleContentData extends BaseContentData {
  topic: string;
  ruleDescription: string;
  examples: Array<{ text: string; translation: string }>;
}

export type ContentItemData =
  | VerbContentData
  | VocabContentData
  | PhraseContentData
  | GrammarRuleContentData
  | ReadingContentData;

export interface ContentItemMetadata {
  difficulty?: number; // 1-5 or similar
  frequency?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface DrillItemPromptTemplate {
  // Defined based on DrillType
  [key: string]: unknown;
}

export interface DrillItemValidationRule {
  expectedForms?: string[];
  acceptDiacritics?: boolean;
  errorMargin?: number;
  [key: string]: unknown;
}
