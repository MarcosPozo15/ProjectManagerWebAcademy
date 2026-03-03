/*
  Warnings:

  - A unique constraint covering the columns `[userId,projectId]` on the table `ProjectSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubmission_userId_projectId_key" ON "ProjectSubmission"("userId", "projectId");
