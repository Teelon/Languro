-- CreateTable
CREATE TABLE "user_vocabulary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" VARCHAR(100) NOT NULL,
    "languageId" INTEGER NOT NULL,
    "contentItemId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encounterCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_vocabulary_userId_lastSeenAt_idx" ON "user_vocabulary"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_vocabulary_userId_languageId_word_key" ON "user_vocabulary"("userId", "languageId", "word");

-- AddForeignKey
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
