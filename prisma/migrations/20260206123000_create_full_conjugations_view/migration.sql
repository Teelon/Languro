-- CreateView: vw_full_conjugations
-- This view provides a denormalized view of all conjugation data for easy querying
CREATE OR REPLACE VIEW vw_full_conjugations AS
SELECT 
    vt.id as verb_translation_id,
    vt.word as infinitive,
    l.iso_code as language,
    vc.concept_name as concept,
    vc.definition,
    t.id as tense_id,
    t.tense_name,
    t.mood,
    p.id as pronoun_id,
    p.label as pronoun,
    c.display_form as text,
    c.auxiliary_part as auxiliary,
    c.root_part as root,
    c.ending_part as ending,
    COALESCE(c.has_audio, false) as has_audio,
    c.audio_file_key,
    c.id as conjugation_id,
    COALESCE(c.vote_score, 0) as vote_score
FROM conjugations c
JOIN verb_translations vt ON c.verb_translation_id = vt.id
JOIN languages l ON vt.language_id = l.id
JOIN tenses t ON c.tense_id = t.id
JOIN pronouns p ON c.pronoun_id = p.id
LEFT JOIN verb_concepts vc ON vt.concept_id = vc.id;

-- Create index-backed function for efficient infinitive lookup (since views can't have indexes)
-- The underlying tables already have indexes on verb_translation_id which will be used
