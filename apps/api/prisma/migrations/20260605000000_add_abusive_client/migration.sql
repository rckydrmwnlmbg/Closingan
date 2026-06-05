-- CreateTable
CREATE TABLE "AbusiveClient" (
    "id" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "reason" TEXT,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbusiveClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbusiveClient_fingerprintHash_key" ON "AbusiveClient"("fingerprintHash");

-- CreateIndex
CREATE INDEX "AbusiveClient_fingerprintHash_idx" ON "AbusiveClient"("fingerprintHash");
