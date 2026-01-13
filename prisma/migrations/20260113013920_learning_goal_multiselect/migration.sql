/*
  Warnings:

  - The `learningGoal` column on the `user_onboarding_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_onboarding_profile" DROP COLUMN "learningGoal",
ADD COLUMN     "learningGoal" TEXT[];
