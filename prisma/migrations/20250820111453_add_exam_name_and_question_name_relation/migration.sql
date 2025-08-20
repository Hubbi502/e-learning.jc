-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."questions" ADD COLUMN     "exam_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
