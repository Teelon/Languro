-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_items" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "drillType" TEXT NOT NULL,
    "promptTemplate" JSONB NOT NULL,
    "validationRule" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "drill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_list_items" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER,
    "notes" TEXT,

    CONSTRAINT "user_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillItemId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "seenCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "currentInterval" INTEGER,
    "nextReviewAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "stage" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillItemId" TEXT NOT NULL,
    "userInput" TEXT,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "errorType" TEXT,
    "errorDetails" JSONB,
    "timeSpentMs" INTEGER,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "promptData" JSONB,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_packs" (
    "id" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "cefrLevel" VARCHAR(2) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_pack_items" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "template_pack_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_items_contentType_languageId_idx" ON "content_items"("contentType", "languageId");

-- CreateIndex
CREATE INDEX "drill_items_contentItemId_drillType_idx" ON "drill_items"("contentItemId", "drillType");

-- CreateIndex
CREATE INDEX "user_lists_userId_languageId_isActive_idx" ON "user_lists"("userId", "languageId", "isActive");

-- CreateIndex
CREATE INDEX "user_list_items_listId_idx" ON "user_list_items"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "user_list_items_listId_contentItemId_key" ON "user_list_items"("listId", "contentItemId");

-- CreateIndex
CREATE INDEX "mastery_userId_nextReviewAt_idx" ON "mastery"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "mastery_userId_score_idx" ON "mastery"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "mastery_userId_drillItemId_key" ON "mastery"("userId", "drillItemId");

-- CreateIndex
CREATE INDEX "attempts_userId_attemptedAt_idx" ON "attempts"("userId", "attemptedAt");

-- CreateIndex
CREATE INDEX "attempts_drillItemId_idx" ON "attempts"("drillItemId");

-- CreateIndex
CREATE INDEX "attempts_userId_isCorrect_attemptedAt_idx" ON "attempts"("userId", "isCorrect", "attemptedAt");

-- CreateIndex
CREATE INDEX "template_packs_languageId_category_cefrLevel_idx" ON "template_packs"("languageId", "category", "cefrLevel");

-- CreateIndex
CREATE INDEX "template_pack_items_packId_sortOrder_idx" ON "template_pack_items"("packId", "sortOrder");

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_items" ADD CONSTRAINT "drill_items_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "user_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery" ADD CONSTRAINT "mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery" ADD CONSTRAINT "mastery_drillItemId_fkey" FOREIGN KEY ("drillItemId") REFERENCES "drill_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_drillItemId_fkey" FOREIGN KEY ("drillItemId") REFERENCES "drill_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_packs" ADD CONSTRAINT "template_packs_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_pack_items" ADD CONSTRAINT "template_pack_items_packId_fkey" FOREIGN KEY ("packId") REFERENCES "template_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
