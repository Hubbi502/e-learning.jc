/*
  Warnings:

  - A unique constraint covering the columns `[student_id,meeting_id]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."attendances_student_id_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_meeting_id_key" ON "attendances"("student_id", "meeting_id");
