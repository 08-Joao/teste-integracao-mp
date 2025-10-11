/*
  Warnings:

  - You are about to drop the `Specialization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DoctorSpecializations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Specialization" DROP CONSTRAINT "Specialization_specialtyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DoctorSpecializations" DROP CONSTRAINT "_DoctorSpecializations_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DoctorSpecializations" DROP CONSTRAINT "_DoctorSpecializations_B_fkey";

-- DropTable
DROP TABLE "public"."Specialization";

-- DropTable
DROP TABLE "public"."_DoctorSpecializations";
