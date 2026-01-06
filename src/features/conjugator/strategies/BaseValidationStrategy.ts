import { LanguageStrategy, ConjugationPart, ValidationResult } from './types';

export abstract class BaseValidationStrategy implements LanguageStrategy {

    validateItem(item: ConjugationPart): ValidationResult {
        const { auxiliary, root, ending } = item;
        const aux = (auxiliary || '').trim();
        const r = (root || '').trim();
        const e = (ending || '').trim();

        if (!r && !e && !aux) {
            return { isValid: false, reason: 'All parts (auxiliary, root, ending) are empty.' };
        }

        if (r.includes(' ')) {
            return { isValid: false, reason: `Root part contains spaces: "${r}"` };
        }

        if (e.includes(' ')) {
            // Some languages might allow spaces in endings (unlikely but possible), 
            // but base rule is strict. subclasses can override.
            return { isValid: false, reason: `Ending part contains spaces: "${e}"` };
        }

        return { isValid: true };
    }

    reconstruct(item: ConjugationPart): string {
        const { auxiliary, root, ending } = item;
        const aux = (auxiliary || '').trim();
        const r = (root || '').trim();
        const e = (ending || '').trim();

        if (aux) {
            // Default space handling. Subclasses can override for elisions (e.g., French "l'").
            return `${aux} ${r}${e}`.trim();
        }
        return `${r}${e}`.trim();
    }

    abstract generatePrompt(verb: string, tenses: string[]): string;
}
