/*
  Warnings:

  - You are about to drop the column `nativeLanguage` on the `user_onboarding_profile` table. All the data in the column will be lost.
  - You are about to drop the column `targetLanguage` on the `user_onboarding_profile` table. All the data in the column will be lost.
  - You are about to alter the column `cefrLevel` on the `user_onboarding_profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(5)` to `VarChar(2)`.
  - A unique constraint covering the columns `[languageId,contentType,verbTranslationId]` on the table `content_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nativeLanguageId` to the `user_onboarding_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetLanguageId` to the `user_onboarding_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attempts" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "content_items" ADD COLUMN     "verbTranslationId" INTEGER,
ALTER COLUMN "data" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_lists" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_onboarding_profile" DROP COLUMN "nativeLanguage",
DROP COLUMN "targetLanguage",
ADD COLUMN     "nativeLanguageId" INTEGER NOT NULL,
ADD COLUMN     "targetLanguageId" INTEGER NOT NULL,
ALTER COLUMN "cefrLevel" SET DATA TYPE VARCHAR(2);

-- CreateIndex
CREATE INDEX "attempts_sessionId_idx" ON "attempts"("sessionId");

-- CreateIndex
CREATE INDEX "content_items_languageId_idx" ON "content_items"("languageId");

-- CreateIndex
CREATE INDEX "content_items_verbTranslationId_idx" ON "content_items"("verbTranslationId");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_languageId_contentType_verbTranslationId_key" ON "content_items"("languageId", "contentType", "verbTranslationId");

-- CreateIndex
CREATE INDEX "drill_items_drillType_idx" ON "drill_items"("drillType");

-- CreateIndex
CREATE INDEX "mastery_userId_stage_idx" ON "mastery"("userId", "stage");

-- CreateIndex
CREATE INDEX "mastery_userId_nextReviewAt_stage_idx" ON "mastery"("userId", "nextReviewAt", "stage");

-- AddForeignKey
ALTER TABLE "user_onboarding_profile" ADD CONSTRAINT "user_onboarding_profile_nativeLanguageId_fkey" FOREIGN KEY ("nativeLanguageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_onboarding_profile" ADD CONSTRAINT "user_onboarding_profile_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_verbTranslationId_fkey" FOREIGN KEY ("verbTranslationId") REFERENCES "verb_translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_pack_items" ADD CONSTRAINT "template_pack_items_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
