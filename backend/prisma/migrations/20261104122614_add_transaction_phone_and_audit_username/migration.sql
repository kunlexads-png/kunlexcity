-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "userName" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "buyerOrTenantPhone" TEXT,
ALTER COLUMN "agentCommissionAmount" SET DEFAULT 0;
