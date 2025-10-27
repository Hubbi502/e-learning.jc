-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "device_id" TEXT NOT NULL DEFAULT 'unknown';

-- CreateIndex
CREATE INDEX "attendances_device_id_idx" ON "attendances"("device_id");

-- CreateIndex
CREATE INDEX "attendances_recorded_at_idx" ON "attendances"("recorded_at");
