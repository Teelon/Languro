export interface VerbConcept {
    id: number;
    concept_name: string;
    definition?: string;
}

export interface VerbTranslation {
    id: number;
    concept_id: number;
    language_id: number;
    word: string;
}

export interface Tense {
    id: number;
    language_id: number;
    category_id: number;
    tense_name: string;
    mood?: string;
    is_literary: boolean;
}

export interface Pronoun {
    id: number;
    language_id: number;
    code: string;
    label: string;
}

export interface Conjugation {
    id: number;
    verb_translation_id: number;
    tense_id: number;
    pronoun_id: number;
    conjugated_form: string;
    auxiliary_part?: string;
    root_part?: string;
    ending_part?: string;
    // HITL Fields
    vote_score?: number;
    is_flagged?: boolean;
}

// Composite type for UI/LLM use
export interface FullConjugationData {
    concept: string;
    definition: string;
    infinitive: string;
    language: 'en' | 'fr' | 'es';
    metadata?: {
        originalInput?: string;
        detectedLanguage?: string;
        source?: 'db-cache' | 'llm-generation' | 'db-fallback';
        wasTranslation?: boolean;
        sourceLanguage?: string;
        targetLanguage?: string;
        wasConjugatedForm?: boolean;
        detectedInfinitive?: string;
    };
    tenses: {
        tense_name: string;
        mood?: string;
        items: {
            pronoun: string;
            text: string;           // Full text "corro"
            auxiliary?: string;     // "have"
            root?: string;          // "corr"
            ending?: string;        // "o"
            pronoun_id?: number; // Internal use
            tense_id?: number;   // Internal use
            has_audio?: boolean; // From DB
            audio_url?: string;  // Generated URL

            // HITL
            conjugation_id?: number;
            vote_score?: number;
        }[];
    }[];
}

export interface Feedback {
    id: number;
    conjugation_id: number;
    vote_type: 'up' | 'down';
    reason?: string;
    status: 'pending' | 'resolved' | 'ignored';
    created_at: string;
}
