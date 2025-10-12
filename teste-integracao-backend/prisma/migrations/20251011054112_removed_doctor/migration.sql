/*
  Warnings:

  - You are about to drop the column `doctorId` on the `ActivityDoctor` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `PracticeLocation` table. All the data in the column will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[activityId,doctorProfileId]` on the table `ActivityDoctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorProfileId` to the `ActivityDoctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorProfileId` to the `PracticeLocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ActivityDoctor" DROP CONSTRAINT "ActivityDoctor_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PracticeLocation" DROP CONSTRAINT "PracticeLocation_doctorId_fkey";

-- DropIndex
DROP INDEX "public"."ActivityDoctor_activityId_doctorId_key";

-- DropIndex
DROP INDEX "public"."ActivityDoctor_doctorId_idx";

-- DropIndex
DROP INDEX "public"."PracticeLocation_doctorId_idx";

-- AlterTable
ALTER TABLE "ActivityDoctor" DROP COLUMN "doctorId",
ADD COLUMN     "doctorProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PracticeLocation" DROP COLUMN "doctorId",
ADD COLUMN     "doctorProfileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Doctor";

-- CreateIndex
CREATE INDEX "ActivityDoctor_doctorProfileId_idx" ON "ActivityDoctor"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDoctor_activityId_doctorProfileId_key" ON "ActivityDoctor"("activityId", "doctorProfileId");

-- CreateIndex
CREATE INDEX "PracticeLocation_doctorProfileId_idx" ON "PracticeLocation"("doctorProfileId");

-- AddForeignKey
ALTER TABLE "ActivityDoctor" ADD CONSTRAINT "ActivityDoctor_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeLocation" ADD CONSTRAINT "PracticeLocation_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
