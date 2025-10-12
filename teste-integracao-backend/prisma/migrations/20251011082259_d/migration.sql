/*
  Warnings:

  - The `status` column on the `OnCallProposal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `OnCallRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OnRequestStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "OnProposalStatus" AS ENUM ('PROPOSAL_SENT', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OnCallProposal" DROP COLUMN "status",
ADD COLUMN     "status" "OnProposalStatus" NOT NULL DEFAULT 'PROPOSAL_SENT';

-- AlterTable
ALTER TABLE "OnCallRequest" DROP COLUMN "status",
ADD COLUMN     "status" "OnRequestStatus" NOT NULL DEFAULT 'OPEN';

-- DropEnum
DROP TYPE "public"."OnCallStatus";

-- CreateIndex
CREATE INDEX "OnCallRequest_status_idx" ON "OnCallRequest"("status");
