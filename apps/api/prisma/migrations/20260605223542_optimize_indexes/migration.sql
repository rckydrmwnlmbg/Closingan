-- CreateIndex
CREATE INDEX "Message_tenantId_createdAt_idx" ON "Message"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_tenantId_deliveryState_idx" ON "Message"("tenantId", "deliveryState");

-- CreateIndex
CREATE INDEX "Message_tenantId_isAiGenerated_idx" ON "Message"("tenantId", "isAiGenerated");

-- CreateIndex
CREATE INDEX "Campaign_tenantId_status_idx" ON "Campaign"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Campaign_tenantId_scheduledAt_idx" ON "Campaign"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "KnowledgeAsset_tenantId_createdAt_idx" ON "KnowledgeAsset"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AbusiveClient_blockedAt_idx" ON "AbusiveClient"("blockedAt");

-- CreateIndex
CREATE INDEX "AbusiveClient_ipAddress_idx" ON "AbusiveClient"("ipAddress");
