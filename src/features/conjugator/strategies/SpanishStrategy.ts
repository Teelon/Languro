import { BaseValidationStrategy } from './BaseValidationStrategy';
import { ConjugationPart, ValidationResult } from './types';

export class SpanishStrategy extends BaseValidationStrategy {

    validateItem(item: ConjugationPart): ValidationResult {
        const baseResult = super.validateItem(item);
        if (!baseResult.isValid) return baseResult;

        // Custom Spanish checks if needed
        // e.g. Ensuring "no" is in auxiliary for negative imperatives if we ever supported that directly here logic-wise
        return { isValid: true };
    }

    generatePrompt(verb: string, tenses: string[]): string {
        const tenseList = tenses.join(', ');
        return `
    SPANISH TENSES (use exactly these names):
    ${tenseList}

    Pronouns (codes): Yo (1S), Tú (2S), Él / Ella / Usted (3S), Nosotros (1P), Vosotros (2P), Ellos / Ellas / Ustedes (3P)

    SPECIAL RULES:
    - For "Subjuntivo Imperfecto", use ONLY the "-ra" form (e.g., "comiera" not "comiera/comiese").
    - For "Imperativo Negativo", put "no" in the auxiliary field.

    STRUCTURAL RULES:
    - root: The stem (NO spaces)
    - ending: The suffix (NO spaces)
    - auxiliary: "haber" forms or "no" or "que"
        `;
    }
}
