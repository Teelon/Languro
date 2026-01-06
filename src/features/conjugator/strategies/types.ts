export interface ValidationResult {
    isValid: boolean;
    reason?: string;
}

export interface ConjugationPart {
    auxiliary?: string;
    root: string;
    ending: string;
    text: string; // The full text (e.g. "I have run")
}

export interface LanguageStrategy {
    /**
     * Validates a single conjugation item (auxiliary, root, ending) against language rules.
     */
    validateItem(item: ConjugationPart): ValidationResult;

    /**
     * Helper to reconstruct the word from parts for verification (Part A + Part B = Whole).
     */
    reconstruct(item: ConjugationPart): string;

    /**
     * Generates the prompt for the LLM for this specific language.
     * @param verb The verb to be conjugated (e.g. "to run", "manger")
     * @param tenses List of tense names for this language to include in the prompt
     */
    generatePrompt(verb: string, tenses: string[]): string;
}
