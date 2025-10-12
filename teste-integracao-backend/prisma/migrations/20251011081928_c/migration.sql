/*
  Warnings:

  - Added the required column `practiceLocationId` to the `OnCallProposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OnCallProposal" ADD COLUMN     "practiceLocationId" TEXT NOT NULL,
ADD COLUMN     "status" "OnCallStatus" NOT NULL DEFAULT 'PROPOSAL_SENT';

-- AddForeignKey
ALTER TABLE "OnCallProposal" ADD CONSTRAINT "OnCallProposal_practiceLocationId_fkey" FOREIGN KEY ("practiceLocationId") REFERENCES "PracticeLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
