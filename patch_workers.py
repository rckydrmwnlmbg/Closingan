with open('apps/api/src/queue/workers/ai-reply.worker.ts', 'r') as f:
    content = f.read()

# Add structured logs to ai-reply worker
content = content.replace("this.logger.log(`Job ${job.id} started for tenant ${tenantId}`);", "this.logger.log({ jobId: job.id, tenantId }, `Job ${job.id} started`);")
content = content.replace("this.logger.error(`Job ${job.id} of type ${job.name} failed with error: ${error.message}`,", "this.logger.error({ jobId: job.id, tenantId: job.data?.tenantId, queue: job.name, error: error.message }, `Job failed with error: ${error.message}`,")
content = content.replace("this.logger.error(`Failed ai-reply job ${job.id}: ${error.message}`);", "this.logger.error({ jobId: job.id, error: error.message }, `Failed ai-reply job ${job.id}: ${error.message}`);")

with open('apps/api/src/queue/workers/ai-reply.worker.ts', 'w') as f:
    f.write(content)

with open('apps/api/src/webhook/webhook.service.ts', 'r') as f:
    content = f.read()

# Structured logs in webhook
content = content.replace("this.logger.log(`Webhook received and verified for Tenant: ${tenantId}`);", "this.logger.log({ tenantId, webhookId: payload.id }, `Webhook received and verified for Tenant: ${tenantId}`);")
content = content.replace("this.logger.error(`Invalid webhook signature.`);", "this.logger.error({ webhookId: payload.id, sender: payload.sender || payload.from }, `Invalid webhook signature.`);")
content = content.replace("this.logger.warn(", "this.logger.warn({ tenantId, webhookId: payload.id },")

with open('apps/api/src/webhook/webhook.service.ts', 'w') as f:
    f.write(content)
