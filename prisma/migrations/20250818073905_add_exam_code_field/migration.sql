/*
  Warnings:

  - A unique constraint covering the columns `[exam_code]` on the table `exams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exam_code` to the `exams` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the column as nullable first
ALTER TABLE "public"."exams" ADD COLUMN "exam_code" TEXT;

-- Step 2: Generate exam codes for existing exams using a simpler approach
DO $$ 
DECLARE 
    exam_record RECORD;
    gengo_counter INTEGER := 1;
    bunka_counter INTEGER := 1;
    exam_year TEXT;
BEGIN
    FOR exam_record IN 
        SELECT id, category, EXTRACT(YEAR FROM created_at) as year 
        FROM "public"."exams" 
        WHERE exam_code IS NULL 
        ORDER BY created_at
    LOOP
        exam_year := exam_record.year::TEXT;
        
        IF exam_record.category = 'Gengo' THEN
            UPDATE "public"."exams" 
            SET exam_code = 'GNG-' || exam_year || '-' || LPAD(gengo_counter::TEXT, 3, '0')
            WHERE id = exam_record.id;
            gengo_counter := gengo_counter + 1;
        ELSIF exam_record.category = 'Bunka' THEN
            UPDATE "public"."exams" 
            SET exam_code = 'BNK-' || exam_year || '-' || LPAD(bunka_counter::TEXT, 3, '0')
            WHERE id = exam_record.id;
            bunka_counter := bunka_counter + 1;
        END IF;
    END LOOP;
END $$;

-- Step 3: Make the column NOT NULL
ALTER TABLE "public"."exams" ALTER COLUMN "exam_code" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "exams_exam_code_key" ON "public"."exams"("exam_code");
