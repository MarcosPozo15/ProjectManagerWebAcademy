/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `TeacherStudentAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TeacherStudentAssignment_teacherId_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudentAssignment_studentId_key" ON "TeacherStudentAssignment"("studentId");
