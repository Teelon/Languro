-- CreateTable
CREATE TABLE "reading_lessons" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "audioKey" TEXT,
    "alignment" JSONB,

    CONSTRAINT "reading_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readingLessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reading_lessons_contentItemId_key" ON "reading_lessons"("contentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_userId_readingLessonId_key" ON "reading_progress"("userId", "readingLessonId");

-- AddForeignKey
ALTER TABLE "reading_lessons" ADD CONSTRAINT "reading_lessons_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_readingLessonId_fkey" FOREIGN KEY ("readingLessonId") REFERENCES "reading_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
