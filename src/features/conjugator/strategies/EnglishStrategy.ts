import { BaseValidationStrategy } from './BaseValidationStrategy';

export class EnglishStrategy extends BaseValidationStrategy {
    generatePrompt(verb: string, tenses: string[]): string {
        const tenseList = tenses.join(', ');
        return `
ENGLISH CONJUGATION RULES (use exactly these tense names):
${tenseList}

PRONOUNS (codes): I (1S), You (2S), He/She/It (3S), We (1P), You (all) (2P), They (3P)

STRUCTURAL RULES:
- root: The verb stem without "to" (NO spaces, NO slashes, NO "to")
- ending: The suffix added to the root (NO spaces, NO slashes)
- auxiliary: Helper verb(s) for compound tenses (e.g., "have", "will", "am", "are", "is", "was", "were", "will be")
- text: Complete conjugated form including pronoun

CONTINUOUS/PROGRESSIVE TENSES (use "auxiliary" + root + "ing"):
- Present Continuous: Use "am/are/is" as auxiliary
  * I am running → root="run", ending="ning", auxiliary="am"
  * You are running → root="run", ending="ning", auxiliary="are"
  * He/She/It is running → root="run", ending="ning", auxiliary="is"
  * We/You(all)/They are running → root="run", ending="ning", auxiliary="are"

- Past Continuous: Use "was/were" as auxiliary
  * I/He/She/It was running → root="run", ending="ning", auxiliary="was"
  * You/We/You(all)/They were running → root="run", ending="ning", auxiliary="were"

- Future Continuous: Use "will be" as auxiliary
  * All pronouns: will be running → root="run", ending="ning", auxiliary="will be"

PRESENT PARTICIPLE (-ing) SPELLING RULES:
1. Regular verbs: add "ing" → root="run", ending="ning"
2. Verbs ending in silent 'e': drop 'e', add "ing" → "drive" becomes root="driv", ending="ing"
3. Short vowel + consonant: double final consonant → "run" becomes root="run", ending="ning"
4. Verbs ending in 'ie': change to 'y' → "lie" becomes root="ly", ending="ing"
5. Verbs ending in 'c': add 'k' → "picnic" becomes root="picnick", ending="ing"

SIMPLE PRESENT TENSES:
- Base form for I/You/We/They → root="run", ending="" (empty)
- Add 's' for He/She/It → root="run", ending="s"
- Special cases: "go"→"goes", "do"→"does", "have"→"has"

SIMPLE PAST TENSES:
- Regular: add "ed" → root="walk", ending="ed"
- Irregular: use correct past form → "run"→"ran" (root="ran", ending="" or root="r", ending="an")

PERFECT TENSES (use "have/has/had" + past participle):
- Present Perfect: "have/has" + past participle
  * I/You/We/They have run → auxiliary="have", root="run", ending="" (if irregular)
  * He/She/It has run → auxiliary="has", root="run", ending=""

- Past Perfect: "had" + past participle
  * All pronouns: had run → auxiliary="had", root="run", ending=""

- Future Perfect: "will have" + past participle
  * All pronouns: will have run → auxiliary="will have", root="run", ending=""

IRREGULAR VERBS - SPECIAL CASES:
- "drive": driven → root="driv", ending="en" (drop final 'e' before suffix)
- "run": ran/run → use appropriate past form
- "go": went/gone → completely irregular
- "be": am/is/are/was/were/been → highly irregular
- "have": has/had → irregular third person

CRITICAL: For ALL continuous tenses, ALWAYS include the appropriate form of "be" (am/is/are/was/were/will be) in the auxiliary field.
        `.trim();
    }
}