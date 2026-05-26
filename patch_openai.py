with open('apps/api/src/ai/openai.service.ts', 'r') as f:
    content = f.read()

content = content.replace("this.logger.log(`AI Reply Generated for Tenant: ${tenantId}`);", "this.logger.log({ tenantId, tokensUsed }, `AI Reply Generated for Tenant: ${tenantId}`);")
content = content.replace("this.logger.log(`Lead Analyzed for Tenant: ${tenantId}`);", "this.logger.log({ tenantId, tokensUsed }, `Lead Analyzed for Tenant: ${tenantId}`);")

with open('apps/api/src/ai/openai.service.ts', 'w') as f:
    f.write(content)
