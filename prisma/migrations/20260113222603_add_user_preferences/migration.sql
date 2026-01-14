-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareProgressWithFriends" BOOLEAN NOT NULL DEFAULT true,
    "showInSearch" BOOLEAN NOT NULL DEFAULT true,
    "dataSharing" BOOLEAN NOT NULL DEFAULT true,
    "activityVisibility" TEXT NOT NULL DEFAULT 'public',
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "pushNotificationTime" TEXT,
    "doNotDisturbStart" TEXT,
    "doNotDisturbEnd" TEXT,
    "communicationLanguage" TEXT NOT NULL DEFAULT 'en',
    "newContentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "recommendedLessons" BOOLEAN NOT NULL DEFAULT true,
    "tipsTricks" BOOLEAN NOT NULL DEFAULT true,
    "pronunciationFeedback" BOOLEAN NOT NULL DEFAULT true,
    "followNotifications" BOOLEAN NOT NULL DEFAULT true,
    "commentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardUpdates" BOOLEAN NOT NULL DEFAULT true,
    "friendActivityUpdates" BOOLEAN NOT NULL DEFAULT true,
    "studyGroupInvites" BOOLEAN NOT NULL DEFAULT true,
    "motivationalMessages" BOOLEAN NOT NULL DEFAULT true,
    "weeklyProgressReports" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT true,
    "surveyEmails" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
