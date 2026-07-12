-- CreateEnum
CREATE TYPE "AbuseFlagType" AS ENUM ('EXCESSIVE_AI_CALLS', 'REPEATED_BLAST_SAME_NUMBER', 'MULTI_IP_LOGIN', 'HIGH_API_RATE');

-- CreateEnum
CREATE TYPE "AbuseFlagStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateTable
CREATE TABLE "AbuseFlag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "flagType" "AbuseFlagType" NOT NULL,
    "details" JSONB NOT NULL,
    "severity" TEXT NOT NULL,
    "status" "AbuseFlagStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbuseFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbuseFlag_tenantId_idx" ON "AbuseFlag"("tenantId");

-- CreateIndex
CREATE INDEX "AbuseFlag_status_idx" ON "AbuseFlag"("status");

-- CreateIndex
CREATE INDEX "AbuseFlag_flagType_idx" ON "AbuseFlag"("flagType");

-- CreateIndex
CREATE INDEX "AbuseFlag_createdAt_idx" ON "AbuseFlag"("createdAt");

-- AddForeignKey
ALTER TABLE "AbuseFlag" ADD CONSTRAINT "AbuseFlag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
