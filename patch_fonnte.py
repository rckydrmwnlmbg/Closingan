with open('apps/api/src/whatsapp/providers/fonnte.service.ts', 'r') as f:
    content = f.read()

# Add structured logging for Fonnte Service
content = content.replace("this.logger.log(`Fonnte message sent successfully for Tenant: ${params.tenantId}`);", "this.logger.log({ tenantId: params.tenantId, to: params.to }, `Fonnte message sent successfully for Tenant: ${params.tenantId}`);")
content = content.replace("this.logger.error(", "this.logger.error(")

with open('apps/api/src/whatsapp/providers/fonnte.service.ts', 'w') as f:
    f.write(content)
