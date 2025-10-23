/*
  Warnings:

  - Added the required column `meeting_id` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."attendances" ADD COLUMN     "meeting_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
