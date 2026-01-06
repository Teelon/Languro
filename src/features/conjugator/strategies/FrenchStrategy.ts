import { BaseValidationStrategy } from './BaseValidationStrategy';
import { ConjugationPart } from './types';

export class FrenchStrategy extends BaseValidationStrategy {

    reconstruct(item: ConjugationPart): string {
        const { auxiliary, root, ending } = item;
        const aux = (auxiliary || '').trim();
        const r = (root || '').trim();
        const e = (ending || '').trim();

        if (aux) {
            // French elision rule: "que" becomes "qu'" before vowel
            // If aux ends in apostrophe (j', qu', l', s'), no space
            const separator = aux.endsWith("'") ? '' : ' ';
            return `${aux}${separator}${r}${e}`.trim();
        }
        return `${r}${e}`.trim();
    }

    generatePrompt(verb: string, tenses: string[]): string {
        const tenseList = tenses.join(', ');
        return `
FRENCH CONJUGATION RULES (use exactly these tense names):
${tenseList}

PRONOUNS (codes): Je / J' (1S), Tu (2S), Il / Elle / On (3S), Nous (1P), Vous (2P), Ils / Elles (3P)

ELISION RULES (CRITICAL):
- "Je" becomes "J'" before vowel or silent 'h' (j'ai, j'aime, j'habite)
- "Que" becomes "Qu'" before vowel (qu'il, qu'elle, qu'on)
- "Le/La" become "L'" before vowel (l'ai, l'avais)
- "Se" becomes "S'" before vowel (s'est, s'était)
- Always use apostrophe with NO space: "J'aime" NOT "J' aime"

STRUCTURAL RULES:
- root: The verb stem (NO spaces, NO slashes)
- ending: The suffix added to stem (NO spaces, NO slashes)
- auxiliary: Helper verb(s) or particle for compound/subjunctive tenses
- text: Complete conjugated form with correct pronoun and elision

VERB GROUPS:
1. -ER verbs (Regular): parler → parl + e/es/e/ons/ez/ent
2. -IR verbs (Regular): finir → fin + is/is/it/issons/issez/issent
3. -RE verbs: vendre → vend + s/s/-/ons/ez/ent
4. Irregular verbs: être, avoir, aller, faire, etc. (see specific rules below)

SIMPLE TENSES (NO auxiliary):

Present Indicative (-ER verbs like "parler"):
- Je parl+e, Tu parl+es, Il/Elle parl+e
- Nous parl+ons, Vous parl+ez, Ils/Elles parl+ent
- root="parl", ending varies by pronoun

Present Indicative (-IR verbs like "finir"):
- Je fin+is, Tu fin+is, Il/Elle fin+it
- Nous fin+issons, Vous fin+issez, Ils/Elles fin+issent
- root="fin", ending="is/is/it/issons/issez/issent"

Imparfait (Imperfect) - ALL verbs use same endings:
- Use nous stem from present, drop -ons, add: ais/ais/ait/ions/iez/aient
- Example "parler": parl+ais, parl+ais, parl+ait, parl+ions, parl+iez, parl+aient

Passé Simple (Literary past):
- -ER: root + ai/as/a/âmes/âtes/èrent
- -IR: root + is/is/it/îmes/îtes/irent
- -RE: root + is/is/it/îmes/îtes/irent

Futur Simple (Simple future):
- Usually infinitive + ai/as/a/ons/ez/ont
- "parler": parler+ai, parler+as, parler+a, parler+ons, parler+ez, parler+ont
- For -RE verbs: drop final 'e' → "vendre" becomes "vendr+ai"

Conditionnel Présent (Conditional):
- Future stem + imparfait endings: ais/ais/ait/ions/iez/aient
- "parler": parler+ais, parler+ais, parler+ait, parler+ions, parler+iez, parler+aient

COMPOUND TENSES (USE auxiliary):

Passé Composé (Present perfect):
- auxiliary="ai/as/a/avons/avez/ont" (avoir) OR "suis/es/est/sommes/êtes/sont" (être)
- Most verbs use AVOIR: J'ai parlé → auxiliary="ai", root="parl", ending="é"
- DR MRS VANDERTRAMP verbs use ÊTRE: Je suis allé → auxiliary="suis", root="all", ending="é"
- Reflexive verbs use ÊTRE: Je me suis lavé → auxiliary="me suis", root="lav", ending="é"

Plus-que-parfait (Pluperfect):
- auxiliary="avais/avais/avait/avions/aviez/avaient" OR "étais/étais/était/étions/étiez/étaient"
- J'avais parlé → auxiliary="avais", root="parl", ending="é"
- J'étais allé → auxiliary="étais", root="all", ending="é"

Futur Antérieur (Future perfect):
- auxiliary="aurai/auras/aura/aurons/aurez/auront" OR "serai/seras/sera/serons/serez/seront"
- J'aurai parlé → auxiliary="aurai", root="parl", ending="é"

Conditionnel Passé (Past conditional):
- auxiliary="aurais/aurais/aurait/aurions/auriez/auraient" OR "serais/serais/serait/serions/seriez/seraient"
- J'aurais parlé → auxiliary="aurais", root="parl", ending="é"

SUBJUNCTIVE TENSES (USE "que/qu'" in auxiliary):

Subjonctif Présent:
- auxiliary="que" (or "qu'" before vowel)
- Use special subjunctive stems + e/es/e/ions/iez/ent
- Que je parl+e → auxiliary="que", root="parl", ending="e"
- Qu'il parl+e → auxiliary="qu'", root="parl", ending="e"

Subjonctif Passé:
- auxiliary="que j'aie" / "que je sois" + past participle
- Que j'aie parlé → auxiliary="que j'aie", root="parl", ending="é"
- Que je sois allé → auxiliary="que je sois", root="all", ending="é"

Subjonctif Imparfait (Literary):
- auxiliary="que" + special imperfect subjunctive endings
- Que je parlasse → auxiliary="que", root="parl", ending="asse"

PAST PARTICIPLE FORMATION:
- -ER verbs: root + "é" → parler → parlé
- -IR verbs: root + "i" → finir → fini
- -RE verbs: root + "u" → vendre → vendu
- Irregular: être→été, avoir→eu, faire→fait, prendre→pris, etc.

AGREEMENT RULES (CRITICAL):
- With ÊTRE auxiliary: past participle agrees with subject in gender/number
  * Il est allé, Elle est allée, Ils sont allés, Elles sont allées
  * Add 'e' for feminine, 's' for plural, 'es' for feminine plural
- With AVOIR: past participle agrees with PRECEDING direct object only
  * J'ai vu Marie (no agreement), La pomme que j'ai vue (agreement)

IRREGULAR VERBS (CRITICAL):

ÊTRE (to be):
- Present: suis/es/est/sommes/êtes/sont
- Imperfect: étais/étais/était/étions/étiez/étaient
- Future: serai/seras/sera/serons/serez/seront
- Past participle: été

AVOIR (to have):
- Present: ai/as/a/avons/avez/ont
- Imperfect: avais/avais/avait/avions/aviez/avaient
- Future: aurai/auras/aura/aurons/aurez/auront
- Past participle: eu

ALLER (to go):
- Present: vais/vas/va/allons/allez/vont
- Imperfect: allais (regular)
- Future: irai/iras/ira/irons/irez/iront
- Past participle: allé (uses ÊTRE)

FAIRE (to do/make):
- Present: fais/fais/fait/faisons/faites/font
- Imperfect: faisais (regular)
- Future: ferai/feras/fera/ferons/ferez/feront
- Past participle: fait

PRENDRE (to take):
- Present: prends/prends/prend/prenons/prenez/prennent
- Past participle: pris

VENIR (to come):
- Present: viens/viens/vient/venons/venez/viennent
- Future: viendrai/viendras/viendra/viendrons/viendrez/viendront
- Past participle: venu (uses ÊTRE)

VOIR (to see):
- Present: vois/vois/voit/voyons/voyez/voient
- Future: verrai/verras/verra/verrons/verrez/verront
- Past participle: vu

POUVOIR (to be able):
- Present: peux/peux/peut/pouvons/pouvez/peuvent
- Future: pourrai/pourras/pourra/pourrons/pourrez/pourront
- Past participle: pu

VOULOIR (to want):
- Present: veux/veux/veut/voulons/voulez/veulent
- Future: voudrai/voudras/voudra/voudrons/voudrez/voudront
- Past participle: voulu

DEVOIR (must/to have to):
- Present: dois/dois/doit/devons/devez/doivent
- Future: devrai/devras/devra/devrons/devrez/devront
- Past participle: dû

REFLEXIVE VERBS:
- Add reflexive pronoun: me/te/se/nous/vous/se
- Use ÊTRE in compound tenses
- Je me lave → root="lav", ending="e", auxiliary="" (simple tense)
- Je me suis lavé → auxiliary="me suis", root="lav", ending="é" (compound)
- With elision: Je m'appelle (m' before vowel)

STEM-CHANGING VERBS:
- ACHETER (è pattern): achète/achètes/achète/achetons/achetez/achètent
- APPELER (double consonant): appelle/appelles/appelle/appelons/appelez/appellent
- MANGER (keep 'e' before 'a'/'o'): mangeons, mangeais
- COMMENCER (ç before 'a'/'o'): commençons, commençais

CRITICAL FORMATTING RULES:
1. Use apostrophe (') with NO space for elision: "J'ai" NOT "J' ai"
2. For subjunctive, "que/qu'" goes in auxiliary field
3. For compound tenses, entire auxiliary verb goes in auxiliary field
4. For reflexive verbs, reflexive pronoun is part of auxiliary in compound tenses
5. Past participle agreement must be shown in the ending when applicable

EXAMPLES:

Simple present (-ER):
- Je parle → auxiliary="", root="parl", ending="e", text="Je parle"
- Tu parles → auxiliary="", root="parl", ending="es", text="Tu parles"

Passé composé (with avoir):
- J'ai parlé → auxiliary="ai", root="parl", ending="é", text="J'ai parlé"
- Nous avons parlé → auxiliary="avons", root="parl", ending="é", text="Nous avons parlé"

Passé composé (with être):
- Je suis allé → auxiliary="suis", root="all", ending="é", text="Je suis allé"
- Elle est allée → auxiliary="est", root="all", ending="ée", text="Elle est allée"

Subjunctive present:
- Que je parle → auxiliary="que", root="parl", ending="e", text="Que je parle"
- Qu'il parle → auxiliary="qu'", root="parl", ending="e", text="Qu'il parle"

Reflexive verb (compound):
- Je me suis lavé → auxiliary="me suis", root="lav", ending="é", text="Je me suis lavé"
- Elle s'est lavée → auxiliary="s'est", root="lav", ending="ée", text="Elle s'est lavée"

Future simple:
- Je parlerai → auxiliary="", root="parler", ending="ai", text="Je parlerai"
- (OR split as: root="parl", ending="erai" if you prefer)
        `.trim();
    }
}