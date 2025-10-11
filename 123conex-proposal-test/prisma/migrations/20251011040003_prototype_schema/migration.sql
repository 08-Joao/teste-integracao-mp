/*
  Warnings:

  - You are about to drop the column `userId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `availableTime` on the `OnCallProposal` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `OnCallProposal` table. All the data in the column will be lost.
  - You are about to drop the column `onCallRequestId` on the `OnCallProposal` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OnCallProposal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `patientId` on the `OnCallRequest` table. All the data in the column will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[activityDoctorId,practiceLocationId]` on the table `ActivityDoctorLocation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Specialty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorAccountId` to the `OnCallProposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestId` to the `OnCallProposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientAccountId` to the `OnCallRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OnCallRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `OnCallRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ADMIN', 'PROFESSIONAL', 'CLIENT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "OnCallStatus" AS ENUM ('PENDING_PROPOSALS', 'PROPOSAL_SENT', 'CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnCallProposal" DROP CONSTRAINT "OnCallProposal_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnCallProposal" DROP CONSTRAINT "OnCallProposal_onCallRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnCallRequest" DROP CONSTRAINT "OnCallRequest_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Patient" DROP CONSTRAINT "Patient_userId_fkey";

-- DropIndex
DROP INDEX "public"."Doctor_userId_key";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ActivityDoctor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ActivityDoctorLocation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "userId",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OnCallProposal" DROP COLUMN "availableTime",
DROP COLUMN "doctorId",
DROP COLUMN "onCallRequestId",
ADD COLUMN     "availableTimes" TIMESTAMP(3)[],
ADD COLUMN     "doctorAccountId" TEXT NOT NULL,
ADD COLUMN     "requestId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OnCallRequest" DROP COLUMN "patientId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "patientAccountId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "radius" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "OnCallStatus" NOT NULL;

-- AlterTable
ALTER TABLE "PracticeLocation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Specialty" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."Patient";

-- DropEnum
DROP TYPE "public"."ON_CALL_STATUS";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialtyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "doctorProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "minBookingTime" INTEGER NOT NULL,
    "addressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientAccountId" TEXT NOT NULL,
    "doctorAccountId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "reviewerAccountId" TEXT NOT NULL,
    "revieweeAccountId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DoctorSpecializations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DoctorSpecializations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_accountId_key" ON "DoctorProfile"("accountId");

-- CreateIndex
CREATE INDEX "DoctorProfile_accountId_idx" ON "DoctorProfile"("accountId");

-- CreateIndex
CREATE INDEX "DoctorProfile_approved_idx" ON "DoctorProfile"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_accountId_key" ON "PatientProfile"("accountId");

-- CreateIndex
CREATE INDEX "PatientProfile_accountId_idx" ON "PatientProfile"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_key" ON "Specialization"("name");

-- CreateIndex
CREATE INDEX "Specialization_name_idx" ON "Specialization"("name");

-- CreateIndex
CREATE INDEX "Specialization_specialtyId_idx" ON "Specialization"("specialtyId");

-- CreateIndex
CREATE INDEX "Address_doctorProfileId_idx" ON "Address"("doctorProfileId");

-- CreateIndex
CREATE INDEX "Address_zipCode_idx" ON "Address"("zipCode");

-- CreateIndex
CREATE INDEX "Address_city_state_idx" ON "Address"("city", "state");

-- CreateIndex
CREATE INDEX "Service_addressId_idx" ON "Service"("addressId");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Appointment_patientAccountId_idx" ON "Appointment"("patientAccountId");

-- CreateIndex
CREATE INDEX "Appointment_doctorAccountId_idx" ON "Appointment"("doctorAccountId");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");

-- CreateIndex
CREATE INDEX "Appointment_dateTime_idx" ON "Appointment"("dateTime");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_appointmentId_key" ON "Review"("appointmentId");

-- CreateIndex
CREATE INDEX "Review_reviewerAccountId_idx" ON "Review"("reviewerAccountId");

-- CreateIndex
CREATE INDEX "Review_revieweeAccountId_idx" ON "Review"("revieweeAccountId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "_DoctorSpecializations_B_index" ON "_DoctorSpecializations"("B");

-- CreateIndex
CREATE INDEX "Activity_specialtyId_idx" ON "Activity"("specialtyId");

-- CreateIndex
CREATE INDEX "Activity_name_idx" ON "Activity"("name");

-- CreateIndex
CREATE INDEX "ActivityDoctor_activityId_idx" ON "ActivityDoctor"("activityId");

-- CreateIndex
CREATE INDEX "ActivityDoctor_doctorId_idx" ON "ActivityDoctor"("doctorId");

-- CreateIndex
CREATE INDEX "ActivityDoctorLocation_activityDoctorId_idx" ON "ActivityDoctorLocation"("activityDoctorId");

-- CreateIndex
CREATE INDEX "ActivityDoctorLocation_practiceLocationId_idx" ON "ActivityDoctorLocation"("practiceLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDoctorLocation_activityDoctorId_practiceLocationId_key" ON "ActivityDoctorLocation"("activityDoctorId", "practiceLocationId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_activityDoctorLocationId_idx" ON "AvailabilitySlot"("activityDoctorLocationId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_day_idx" ON "AvailabilitySlot"("day");

-- CreateIndex
CREATE INDEX "Doctor_name_idx" ON "Doctor"("name");

-- CreateIndex
CREATE INDEX "OnCallProposal_doctorAccountId_idx" ON "OnCallProposal"("doctorAccountId");

-- CreateIndex
CREATE INDEX "OnCallProposal_requestId_idx" ON "OnCallProposal"("requestId");

-- CreateIndex
CREATE INDEX "OnCallRequest_patientAccountId_idx" ON "OnCallRequest"("patientAccountId");

-- CreateIndex
CREATE INDEX "OnCallRequest_status_idx" ON "OnCallRequest"("status");

-- CreateIndex
CREATE INDEX "OnCallRequest_serviceName_idx" ON "OnCallRequest"("serviceName");

-- CreateIndex
CREATE INDEX "PracticeLocation_doctorId_idx" ON "PracticeLocation"("doctorId");

-- CreateIndex
CREATE INDEX "PracticeLocation_zipCode_idx" ON "PracticeLocation"("zipCode");

-- CreateIndex
CREATE INDEX "PracticeLocation_city_state_idx" ON "PracticeLocation"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");

-- CreateIndex
CREATE INDEX "Specialty_name_idx" ON "Specialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorAccountId_fkey" FOREIGN KEY ("doctorAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnCallRequest" ADD CONSTRAINT "OnCallRequest_patientAccountId_fkey" FOREIGN KEY ("patientAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnCallProposal" ADD CONSTRAINT "OnCallProposal_doctorAccountId_fkey" FOREIGN KEY ("doctorAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnCallProposal" ADD CONSTRAINT "OnCallProposal_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OnCallRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerAccountId_fkey" FOREIGN KEY ("reviewerAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeAccountId_fkey" FOREIGN KEY ("revieweeAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorSpecializations" ADD CONSTRAINT "_DoctorSpecializations_A_fkey" FOREIGN KEY ("A") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorSpecializations" ADD CONSTRAINT "_DoctorSpecializations_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
