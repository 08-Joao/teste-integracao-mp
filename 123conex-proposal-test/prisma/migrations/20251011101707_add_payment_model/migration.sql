-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "mercadoPagoPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "payerEmail" TEXT NOT NULL,
    "payerDocType" TEXT NOT NULL,
    "payerDocNumber" TEXT NOT NULL,
    "statusDetail" TEXT,
    "transactionAmount" DOUBLE PRECISION,
    "netReceivedAmount" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_proposalId_key" ON "Payment"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadoPagoPaymentId_key" ON "Payment"("mercadoPagoPaymentId");

-- CreateIndex
CREATE INDEX "Payment_proposalId_idx" ON "Payment"("proposalId");

-- CreateIndex
CREATE INDEX "Payment_mercadoPagoPaymentId_idx" ON "Payment"("mercadoPagoPaymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "OnCallProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
