/*
  Warnings:

  - Made the column `language_id` on table `pronouns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `language_id` on table `verb_translations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "conjugation_feedback" DROP CONSTRAINT "conjugation_feedback_conjugation_id_fkey";

-- DropForeignKey
ALTER TABLE "conjugations" DROP CONSTRAINT "conjugations_pronoun_id_fkey";

-- DropForeignKey
ALTER TABLE "conjugations" DROP CONSTRAINT "conjugations_tense_id_fkey";

-- DropForeignKey
ALTER TABLE "conjugations" DROP CONSTRAINT "conjugations_verb_translation_id_fkey";

-- DropForeignKey
ALTER TABLE "pronouns" DROP CONSTRAINT "pronouns_language_id_fkey";

-- DropForeignKey
ALTER TABLE "tenses" DROP CONSTRAINT "tenses_category_id_fkey";

-- DropForeignKey
ALTER TABLE "tenses" DROP CONSTRAINT "tenses_language_id_fkey";

-- DropForeignKey
ALTER TABLE "verb_translations" DROP CONSTRAINT "verb_translations_concept_id_fkey";

-- DropForeignKey
ALTER TABLE "verb_translations" DROP CONSTRAINT "verb_translations_language_id_fkey";

-- DropIndex
DROP INDEX "idx_conjugations_display_trgm";

-- DropIndex
DROP INDEX "idx_verb_translations_word_trgm";

-- AlterTable
ALTER TABLE "conjugation_feedback" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pronouns" ALTER COLUMN "language_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "verb_translations" ALTER COLUMN "language_id" SET NOT NULL;

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
