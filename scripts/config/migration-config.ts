
export const MIGRATION_CONFIG = {
  // Languages to process
  supportedLanguages: ['es', 'en', 'fr'],

  // Batch processing
  batchSize: 50,
  maxConcurrentBatches: 5,

  // Gemini settings
  llm: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.3,
  },

  // Feature flags
  useLLM: true,
  fallbackToRules: true,

  // Logging
  verboseLogging: true,

  // Safety
  dryRun: false, // Set to true to test without writing
} as const;

export const LANGUAGE_CONFIGS = {
  es: {
    name: 'Spanish',
    commonIrregulars: [
      'ser', 'estar', 'ir', 'haber', 'tener', 'hacer', 'poder',
      'decir', 'dar', 'ver', 'saber', 'querer', 'venir', 'poner',
      'parecer', 'conocer', 'salir', 'volver', 'seguir', 'llevar'
    ],
    regularPatterns: {
      ar: 'first_conjugation',
      er: 'second_conjugation',
      ir: 'third_conjugation'
    }
  },
  fr: {
    name: 'French',
    commonIrregulars: [
      'être', 'avoir', 'aller', 'faire', 'dire', 'pouvoir',
      'voir', 'vouloir', 'venir', 'devoir', 'prendre', 'savoir',
      'falloir', 'mettre', 'tenir', 'connaître'
    ],
    regularPatterns: {
      er: 'first_group',
      ir: 'second_group',
      re: 'third_group',
      oir: 'third_group'
    }
  },
  en: {
    name: 'English',
    commonIrregulars: [
      'be', 'have', 'do', 'say', 'go', 'get', 'make', 'know',
      'think', 'take', 'see', 'come', 'want', 'give', 'use',
      'find', 'tell', 'work', 'call', 'try', 'ask', 'need',
      'feel', 'become', 'leave', 'put', 'mean', 'keep'
    ],
    regularPatterns: {}
  }
} as const;
