-- CreateTable
CREATE TABLE "writing_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "difficulty" VARCHAR(2) NOT NULL,
    "topic" TEXT,
    "description" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_prompts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "promptText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_submissions" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "originalInput" TEXT,
    "handwritingKey" TEXT,
    "recognizedText" TEXT,
    "correctedText" TEXT NOT NULL,
    "corrections" JSONB NOT NULL,
    "overallFeedback" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vw_full_conjugations" (
    "conjugation_id" INTEGER NOT NULL,
    "verb_translation_id" INTEGER NOT NULL,
    "infinitive" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "concept" TEXT,
    "definition" TEXT,
    "tense_id" INTEGER NOT NULL,
    "tense_name" TEXT NOT NULL,
    "mood" TEXT,
    "pronoun_id" INTEGER NOT NULL,
    "pronoun" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "auxiliary" TEXT,
    "root" TEXT,
    "ending" TEXT,
    "has_audio" BOOLEAN NOT NULL,
    "audio_file_key" TEXT,
    "vote_score" INTEGER NOT NULL,

    CONSTRAINT "vw_full_conjugations_pkey" PRIMARY KEY ("conjugation_id")
);

-- CreateIndex
CREATE INDEX "writing_images_difficulty_isActive_idx" ON "writing_images"("difficulty", "isActive");

-- CreateIndex
CREATE INDEX "writing_prompts_userId_idx" ON "writing_prompts"("userId");

-- CreateIndex
CREATE INDEX "writing_submissions_userId_idx" ON "writing_submissions"("userId");

-- CreateIndex
CREATE INDEX "writing_submissions_promptId_idx" ON "writing_submissions"("promptId");

-- AddForeignKey
ALTER TABLE "writing_prompts" ADD CONSTRAINT "writing_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_prompts" ADD CONSTRAINT "writing_prompts_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "writing_images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_prompts" ADD CONSTRAINT "writing_prompts_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "writing_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
