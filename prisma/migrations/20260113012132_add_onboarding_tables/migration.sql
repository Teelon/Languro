-- CreateTable
CREATE TABLE "user_onboarding_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nativeLanguage" VARCHAR(5) NOT NULL,
    "targetLanguage" VARCHAR(5) NOT NULL,
    "cefrLevel" VARCHAR(5) NOT NULL,
    "learningGoal" VARCHAR(20) NOT NULL,
    "dailyCommitment" INTEGER NOT NULL,
    "interests" TEXT[],
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_onboarding_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_profile_userId_key" ON "user_onboarding_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_userId_key" ON "onboarding_progress"("userId");

-- AddForeignKey
ALTER TABLE "user_onboarding_profile" ADD CONSTRAINT "user_onboarding_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
