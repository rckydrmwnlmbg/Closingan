CREATE TABLE "DeadLetterLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "queueName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadLetterLog_pkey" PRIMARY KEY ("id")
);
