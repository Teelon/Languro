-- CreateEnum
CREATE TYPE "feedback_vote_type" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "feedback_status" AS ENUM ('pending', 'resolved', 'ignored');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetTokenExp" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "iso_code" VARCHAR(5) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tense_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "tense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronouns" (
    "id" SERIAL NOT NULL,
    "language_id" INTEGER NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "label" VARCHAR(50) NOT NULL,

    CONSTRAINT "pronouns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_concepts" (
    "id" SERIAL NOT NULL,
    "concept_name" VARCHAR(100) NOT NULL,
    "definition" TEXT,

    CONSTRAINT "verb_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_translations" (
    "id" SERIAL NOT NULL,
    "concept_id" INTEGER,
    "language_id" INTEGER NOT NULL,
    "word" VARCHAR(100) NOT NULL,

    CONSTRAINT "verb_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenses" (
    "id" SERIAL NOT NULL,
    "language_id" INTEGER,
    "category_id" INTEGER,
    "tense_name" VARCHAR(100) NOT NULL,
    "mood" VARCHAR(50) DEFAULT 'Indicative',
    "is_literary" BOOLEAN DEFAULT false,

    CONSTRAINT "tenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conjugations" (
    "id" SERIAL NOT NULL,
    "verb_translation_id" INTEGER,
    "tense_id" INTEGER,
    "pronoun_id" INTEGER,
    "auxiliary_part" VARCHAR(50),
    "root_part" VARCHAR(50),
    "ending_part" VARCHAR(50),
    "display_form" VARCHAR(255) NOT NULL,
    "has_audio" BOOLEAN DEFAULT false,
    "audio_file_key" VARCHAR(255),
    "vote_score" INTEGER DEFAULT 0,
    "is_flagged" BOOLEAN DEFAULT false,

    CONSTRAINT "conjugations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conjugation_feedback" (
    "id" SERIAL NOT NULL,
    "conjugation_id" INTEGER,
    "vote_type" "feedback_vote_type" NOT NULL,
    "reason" TEXT,
    "ip_hash" VARCHAR(64),
    "user_id" TEXT,
    "status" "feedback_status" DEFAULT 'pending',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conjugation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "languages_iso_code_key" ON "languages"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "verb_concepts_concept_name_key" ON "verb_concepts"("concept_name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_lang_word" ON "verb_translations"("language_id", "word");

-- CreateIndex
CREATE INDEX "idx_conjugations_display_search" ON "conjugations"("display_form");

-- CreateIndex
CREATE INDEX "idx_conjugations_lookup" ON "conjugations"("verb_translation_id", "tense_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_conjugation" ON "conjugations"("verb_translation_id", "tense_id", "pronoun_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_feedback_ip" ON "conjugation_feedback"("conjugation_id", "ip_hash");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronouns" ADD CONSTRAINT "pronouns_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_translations" ADD CONSTRAINT "verb_translations_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "verb_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_translations" ADD CONSTRAINT "verb_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenses" ADD CONSTRAINT "tenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenses" ADD CONSTRAINT "tenses_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugations" ADD CONSTRAINT "conjugations_pronoun_id_fkey" FOREIGN KEY ("pronoun_id") REFERENCES "pronouns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugations" ADD CONSTRAINT "conjugations_tense_id_fkey" FOREIGN KEY ("tense_id") REFERENCES "tenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugations" ADD CONSTRAINT "conjugations_verb_translation_id_fkey" FOREIGN KEY ("verb_translation_id") REFERENCES "verb_translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugation_feedback" ADD CONSTRAINT "conjugation_feedback_conjugation_id_fkey" FOREIGN KEY ("conjugation_id") REFERENCES "conjugations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjugation_feedback" ADD CONSTRAINT "conjugation_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
