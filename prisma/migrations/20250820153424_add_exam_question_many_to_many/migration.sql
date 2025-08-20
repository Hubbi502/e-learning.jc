/*
  Warnings:

  - You are about to drop the column `exam_id` on the `questions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_exam_id_fkey";

-- AlterTable
ALTER TABLE "public"."questions" DROP COLUMN "exam_id";

-- CreateTable
CREATE TABLE "public"."exam_questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_exam_id_question_id_key" ON "public"."exam_questions"("exam_id", "question_id");

-- AddForeignKey
ALTER TABLE "public"."exam_questions" ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_questions" ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
