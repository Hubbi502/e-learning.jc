/*
  Warnings:

  - You are about to drop the column `category` on the `questions` table. All the data in the column will be lost.

*/

-- CreateTable first
CREATE TABLE "public"."question_categories" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_categories_question_id_category_key" ON "public"."question_categories"("question_id", "category");

-- AddForeignKey
ALTER TABLE "public"."question_categories" ADD CONSTRAINT "question_categories_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from questions.category to question_categories table
INSERT INTO "public"."question_categories" ("id", "question_id", "category", "created_at")
SELECT 
    gen_random_uuid(),
    "id",
    "category",
    CURRENT_TIMESTAMP
FROM "public"."questions"
WHERE "category" IS NOT NULL;

-- Now drop the category column
ALTER TABLE "public"."questions" DROP COLUMN "category";
