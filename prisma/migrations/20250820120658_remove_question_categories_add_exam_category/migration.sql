/*
  Warnings:

  - You are about to drop the `question_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."question_categories" DROP CONSTRAINT "question_categories_question_id_fkey";

-- DropTable
DROP TABLE "public"."question_categories";
