-- SEED DATA FOR ALL LANGUAGES (EN, FR, ES)
-- Idempotent script to populate initial metadata.

-- 1. LANGUAGES
INSERT INTO languages (name, iso_code) VALUES 
('English', 'en'),
('French', 'fr'),
('Spanish', 'es')
ON CONFLICT (iso_code) DO NOTHING;


-- 2. ENGLISH DATA
-- Pronouns
INSERT INTO pronouns (language_id, code, label) VALUES
((SELECT id FROM languages WHERE iso_code = 'en'), '1S', 'I'),
((SELECT id FROM languages WHERE iso_code = 'en'), '2S', 'You'),
((SELECT id FROM languages WHERE iso_code = 'en'), '3S', 'He/She/It'),
((SELECT id FROM languages WHERE iso_code = 'en'), '1P', 'We'),
((SELECT id FROM languages WHERE iso_code = 'en'), '2P', 'You (all)'),
((SELECT id FROM languages WHERE iso_code = 'en'), '3P', 'They');

-- Tenses
INSERT INTO tenses (language_id, category_id, tense_name, mood, is_literary) VALUES
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Present'), 'Simple Present', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Simple Past', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Future Simple', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Present'), 'Present Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Past Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Future Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Present Perfect', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Past Perfect', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Future Perfect', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Present Perfect Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Past Perfect Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Future Perfect Continuous', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Conditional'), 'Conditional Simple', 'Conditional', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Conditional'), 'Conditional Perfect', 'Conditional', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Imperative'), 'Imperative', 'Imperative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Subjunctive'), 'Subjunctive Present', 'Subjunctive', FALSE),
((SELECT id FROM languages WHERE iso_code = 'en'), (SELECT id FROM tense_categories WHERE name = 'Subjunctive'), 'Subjunctive Past', 'Subjunctive', FALSE);


-- 3. FRENCH DATA
-- Pronouns
INSERT INTO pronouns (language_id, code, label) VALUES
((SELECT id FROM languages WHERE iso_code = 'fr'), '1S', 'Je / J'''),
((SELECT id FROM languages WHERE iso_code = 'fr'), '2S', 'Tu'),
((SELECT id FROM languages WHERE iso_code = 'fr'), '3S', 'Il / Elle / On'),
((SELECT id FROM languages WHERE iso_code = 'fr'), '1P', 'Nous'),
((SELECT id FROM languages WHERE iso_code = 'fr'), '2P', 'Vous'),
((SELECT id FROM languages WHERE iso_code = 'fr'), '3P', 'Ils / Elles');

-- Tenses
INSERT INTO tenses (language_id, category_id, tense_name, mood, is_literary) VALUES
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Present'), 'Présent', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Imparfait', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Passé Composé', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Futur Simple', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Conditional'), 'Conditionnel Présent', 'Conditional', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Subjunctive'), 'Subjonctif Présent', 'Subjunctive', FALSE),
((SELECT id FROM languages WHERE iso_code = 'fr'), (SELECT id FROM tense_categories WHERE name = 'Imperative'), 'Impératif Présent', 'Imperative', FALSE);


-- 4. SPANISH DATA
-- Pronouns
INSERT INTO pronouns (language_id, code, label) VALUES
((SELECT id FROM languages WHERE iso_code = 'es'), '1S', 'Yo'),
((SELECT id FROM languages WHERE iso_code = 'es'), '2S', 'Tú'),
((SELECT id FROM languages WHERE iso_code = 'es'), '3S', 'Él / Ella / Usted'),
((SELECT id FROM languages WHERE iso_code = 'es'), '1P', 'Nosotros'),
((SELECT id FROM languages WHERE iso_code = 'es'), '2P', 'Vosotros'),
((SELECT id FROM languages WHERE iso_code = 'es'), '3P', 'Ellos / Ellas / Ustedes');

-- Tenses
INSERT INTO tenses (language_id, category_id, tense_name, mood, is_literary) VALUES
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Present'), 'Presente', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Pretérito Imperfecto', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Past'), 'Pretérito Perfecto Simple', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Future'), 'Futuro Simple', 'Indicative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Conditional'), 'Condicional Simple', 'Conditional', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Subjunctive'), 'Presente de Subjuntivo', 'Subjunctive', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Subjunctive'), 'Subjuntivo Imperfecto', 'Subjunctive', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Imperative'), 'Imperativo Afirmativo', 'Imperative', FALSE),
((SELECT id FROM languages WHERE iso_code = 'es'), (SELECT id FROM tense_categories WHERE name = 'Imperative'), 'Imperativo Negativo', 'Imperative', FALSE);
