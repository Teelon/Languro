/* ==================================================
1. DROP PREAMBLE: Safe, idempotent drops
================================================== */
drop table if exists conjugation_feedback CASCADE;

drop table if exists conjugations CASCADE;

drop table if exists verb_translations CASCADE;

drop table if exists tenses CASCADE;

drop table if exists pronouns CASCADE;

drop table if exists verb_concepts CASCADE;

drop table if exists tense_categories CASCADE;

drop table if exists languages CASCADE;

drop type IF exists feedback_vote_type;

drop type IF exists feedback_status;

/* ==================================================
2. THE CONSTANTS (Lookups)
================================================== */
create table languages (
  id SERIAL primary key,
  name VARCHAR(50) not null,
  iso_code VARCHAR(5) unique not null -- 'en', 'fr', 'es'
);

create table tense_categories (id SERIAL primary key, name VARCHAR(50) not null);

create table pronouns (
  id SERIAL primary key,
  language_id INT references languages (id) on delete CASCADE,
  code VARCHAR(10) not null,
  label VARCHAR(50) not null
);

/* ==================================================
3. THE MEANING (The Anchor)
================================================== */
create table verb_concepts (
  id SERIAL primary key,
  concept_name VARCHAR(100) not null unique, -- "to run"
  definition TEXT
);

/* ==================================================
4. THE GRAMMAR (Language Specifics)
================================================== */
create table tenses (
  id SERIAL primary key,
  language_id INT references languages (id) on delete CASCADE,
  category_id INT references tense_categories (id),
  tense_name VARCHAR(100) not null,
  mood VARCHAR(50) default 'Indicative',
  is_literary BOOLEAN default false
);

create table verb_translations (
  id SERIAL primary key,
  concept_id INT references verb_concepts (id) on delete CASCADE,
  language_id INT references languages (id) on delete CASCADE,
  word VARCHAR(100) not null,
  constraint uq_lang_word unique (language_id, word)
);

/* ==================================================
5. THE CONTENT (Conjugations + Final Logic)
================================================== */
create table conjugations (
  id SERIAL primary key,
  verb_translation_id INT references verb_translations (id) on delete CASCADE,
  tense_id INT references tenses (id),
  pronoun_id INT references pronouns (id),
  -- The Parts (For Analysis & Highlighting)
  auxiliary_part VARCHAR(50),
  root_part VARCHAR(50),
  ending_part VARCHAR(50),
  -- NEW: The Final Form (For Display & Search)
  -- This is automatically populated by a trigger
  display_form VARCHAR(255) not null,
  -- Metadata
  has_audio BOOLEAN default false,
  audio_file_key VARCHAR(255),
  vote_score INT default 0,
  is_flagged BOOLEAN default false,
  constraint uq_conjugation unique (verb_translation_id, tense_id, pronoun_id)
);

/* ==================================================
6. TRIGGERS & FUNCTIONS
================================================== */
-- Function: Auto-calculate display_form on insert/update
create or replace function build_display_form () RETURNS TRIGGER as $$ BEGIN
    -- Concatenate parts, handling NULLs gracefully
    -- Logic: Aux + space + Root + End
    NEW.display_form = TRIM(
        COALESCE(NEW.auxiliary_part || ' ', '') || 
        COALESCE(NEW.root_part, '') || 
        COALESCE(NEW.ending_part, '')
    );
    
    RETURN NEW;
END;
 $$ LANGUAGE plpgsql;

-- Trigger: Bind function to table
create trigger tr_build_display_form BEFORE INSERT
or
update on conjugations for EACH row
execute FUNCTION build_display_form ();

/* ==================================================
7. INDEXES (Optimized for Search)
================================================== */
-- Index for the "Exact Match" search flow
create index idx_conjugations_display_search on conjugations (display_form);

-- Index for the "Fuzzy" search flow (requires pg_trgm extension)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm; 
-- CREATE INDEX idx_conjugations_fuzzy ON conjugations USING gin(display_form gin_trgm_ops);
-- Composite index for fast conjugation table lookups
create index idx_conjugations_lookup on conjugations (verb_translation_id, tense_id);

/* ==================================================
8. FEEDBACK (HITL)
================================================== */
create type feedback_vote_type as ENUM('up', 'down');

create type feedback_status as ENUM('pending', 'resolved', 'ignored');

create table conjugation_feedback (
  id SERIAL primary key,
  conjugation_id INT references conjugations (id) on delete CASCADE,
  vote_type feedback_vote_type not null,
  reason TEXT,
  ip_hash VARCHAR(64),
  status feedback_status default 'pending',
  created_at TIMESTAMP default NOW(),
  constraint uq_feedback_ip unique (conjugation_id, ip_hash)
);

create or replace function update_conjugation_score () RETURNS TRIGGER as $$ BEGIN
    UPDATE conjugations
    SET vote_score = (
        SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
        FROM conjugation_feedback
        WHERE conjugation_id = NEW.conjugation_id
    )
    WHERE id = NEW.conjugation_id;
    
    UPDATE conjugations
    SET is_flagged = TRUE
    WHERE id = NEW.conjugation_id AND vote_score <= -5;

    RETURN NEW;
END;
 $$ LANGUAGE plpgsql;

create trigger tr_update_score
after INSERT
or
update
or DELETE on conjugation_feedback for EACH row
execute FUNCTION update_conjugation_score ();