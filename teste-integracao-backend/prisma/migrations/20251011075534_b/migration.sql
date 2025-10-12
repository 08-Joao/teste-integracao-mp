/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `OnCallRequest` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `ActivityDoctorLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityDoctorLocationId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityDoctorLocationId` to the `OnCallRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_doctorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_addressId_fkey";

-- DropIndex
DROP INDEX "public"."Appointment_serviceId_idx";

-- DropIndex
DROP INDEX "public"."OnCallRequest_serviceName_idx";

-- AlterTable
ALTER TABLE "ActivityDoctorLocation" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "serviceId",
ADD COLUMN     "activityDoctorLocationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OnCallRequest" DROP COLUMN "serviceName",
ADD COLUMN     "activityDoctorLocationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Address";

-- DropTable
DROP TABLE "public"."Service";

-- CreateIndex
CREATE INDEX "Appointment_activityDoctorLocationId_idx" ON "Appointment"("activityDoctorLocationId");

-- CreateIndex
CREATE INDEX "OnCallRequest_activityDoctorLocationId_idx" ON "OnCallRequest"("activityDoctorLocationId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_activityDoctorLocationId_fkey" FOREIGN KEY ("activityDoctorLocationId") REFERENCES "ActivityDoctorLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnCallRequest" ADD CONSTRAINT "OnCallRequest_activityDoctorLocationId_fkey" FOREIGN KEY ("activityDoctorLocationId") REFERENCES "ActivityDoctorLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
