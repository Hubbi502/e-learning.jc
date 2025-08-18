/*
  Warnings:

  - You are about to drop the column `username` on the `admin_users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `admin_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."admin_users_username_key";

-- AlterTable
ALTER TABLE "public"."admin_users" DROP COLUMN "username",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");
