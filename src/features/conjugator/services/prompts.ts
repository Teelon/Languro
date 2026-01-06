// This file is deprecated - prompts are now built dynamically in llm.ts
// using tense names fetched from the database via metadata.ts
// 
// Keeping this file for reference only.
// The old language-specific prompts have been consolidated into a single
// auto-detection prompt in llm.ts that:
// 1. Fetches tense names from the database
// 2. Injects them into the prompt
// 3. Instructs the LLM to use ONLY those exact tense names

export const DEPRECATED_NOTE = `
This file contained separate prompts for English, French, and Spanish.
These have been replaced by a dynamic prompt in llm.ts that:
- Auto-detects the input verb's language
- Uses exact tense names from the database
- Returns conjugations for the detected language
`;
