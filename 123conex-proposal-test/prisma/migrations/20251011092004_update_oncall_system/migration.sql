/*
  Warnings:

  - You are about to drop the column `activityDoctorLocationId` on the `OnCallRequest` table. All the data in the column will be lost.
  - Added the required column `activityId` to the `OnCallRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OnCallRequest" DROP CONSTRAINT "OnCallRequest_activityDoctorLocationId_fkey";

-- DropIndex
DROP INDEX "public"."OnCallRequest_activityDoctorLocationId_idx";

-- AlterTable
ALTER TABLE "OnCallRequest" DROP COLUMN "activityDoctorLocationId",
ADD COLUMN     "activityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "OnCallRequest_activityId_idx" ON "OnCallRequest"("activityId");

-- AddForeignKey
ALTER TABLE "OnCallRequest" ADD CONSTRAINT "OnCallRequest_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
