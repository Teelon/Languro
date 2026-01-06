import { LanguageStrategy } from './types';
import { EnglishStrategy } from './EnglishStrategy';
import { FrenchStrategy } from './FrenchStrategy';
import { SpanishStrategy } from './SpanishStrategy';

export class LanguageStrategyFactory {

    private static strategies: Record<string, LanguageStrategy> = {
        'en': new EnglishStrategy(),
        'fr': new FrenchStrategy(),
        'es': new SpanishStrategy(),
    };

    static getStrategy(languageCode: string): LanguageStrategy {
        const strategy = this.strategies[languageCode.toLowerCase()];
        if (!strategy) {
            throw new Error(`No strategy implemented for language code: ${languageCode}`);
        }
        return strategy;
    }
}
