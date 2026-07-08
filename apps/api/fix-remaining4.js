const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. audit.service.ts
replaceInFile('src/common/audit/audit.service.ts', [
  [/this\.cls\.get\('user'\) as \{ id\?: string \} \| undefined\?\.id/g, "(this.cls.get<{id?: string}>('user'))?.id"]
]);

// 2. admin.controller.ts
replaceInFile('src/modules/admin/admin.controller.ts', [
  [/req: any: any/g, "req: any"]
]);

// 3. conversation.service.ts
replaceInFile('src/modules/conversation/conversation.service.ts', [
  [/const \{ data, meta \} = \(await this\.conversationRepository\.findConversations\) as any\(\n\s*tenantId,\n\s*query,\n\s*\);/g, "const { data, meta } = (await this.conversationRepository.findConversations(\n      tenantId,\n      query,\n    )) as any;"]
]);

// 4. plan-entitlement.guard.ts
replaceInFile('src/common/guards/entitlement/plan-entitlement.guard.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"],
  [/const userTenantId = request\.user\?\.tenantId;/g, "const userTenantId = (request.user as { tenantId?: string })?.tenantId;"]
]);

// 5. ai-safety.service.ts
replaceInFile('src/ai/ai-safety.service.ts', [
  [/catch \(e\)/g, "catch"]
]);

// 6. openai.service.ts
replaceInFile('src/ai/openai.service.ts', [
  [/const promptTokens = /g, "const _promptTokens = "],
  [/const completionTokens = /g, "const _completionTokens = "],
  [/const response = await this\.aiClient\.chat\.completions\.create/g, "const response: any = await this.aiClient.chat.completions.create"]
]);

// 7. app.module.ts
replaceInFile('src/app.module.ts', [
  [/import \{ ConfigService \} from '@nestjs\/config';\n/g, ""],
  [/inject: \[ConfigService\],\n        useFactory: \(config: ConfigService\) => \(\{/g, "useFactory: () => ({"]
]);

// 8. auth-otp.service.ts
replaceInFile('src/auth/auth-otp.service.ts', [
  [/await crypto\.randomInt/g, "crypto.randomInt"]
]);

// 9. auth-password.service.ts
replaceInFile('src/auth/auth-password.service.ts', [
  [/await crypto\.randomBytes/g, "crypto.randomBytes"]
]);

// 10. auth.controller.ts
replaceInFile('src/auth/auth.controller.ts', [
  [/const tenant = await this\.tenantService\.createTenant/g, "const tenant: any = await this.tenantService.createTenant"],
  [/const token = await this\.authOtpService\.verifyOtp/g, "const token: any = await this.authOtpService.verifyOtp"]
]);

// 11. jwt.strategy.ts
replaceInFile('src/auth/strategies/jwt.strategy.ts', [
  [/async validate/g, "validate"]
]);

// 12. tenant.decorator.ts
replaceInFile('src/common/decorators/tenant.decorator.ts', [
  [/const request = ctx\.switchToHttp\(\)\.getRequest\(\);/g, "const request = ctx.switchToHttp().getRequest<{ user?: { tenantId?: string } }>();"],
  [/return request\.user\?\.tenantId;/g, "return request.user?.tenantId;"]
]);

// 13. user.decorator.ts
replaceInFile('src/common/decorators/user.decorator.ts', [
  [/const request = ctx\.switchToHttp\(\)\.getRequest\(\);/g, "const request = ctx.switchToHttp().getRequest<{ user?: any }>();"]
]);

// 14. provider-degradation.exception.ts
replaceInFile('src/common/exceptions/provider-degradation.exception.ts', [
  [/super\(\n\s*'PROVIDER_DEGRADED',\n\s*`Provider \$\{providerName\} is currently degraded\. Please try again later\.`,\n\s*503,\n\s*\{\},\n\s*\);/g, "super(\n      'PROVIDER_DEGRADED',\n      `Provider ${providerName} is currently degraded. Please try again later.`,\n      503\n    );"]
]);

// 15. backup.service.ts
replaceInFile('src/modules/backup/backup.service.ts', [
  [/const data = JSON\.parse/g, "const data: any = JSON.parse"]
]);

// 16. quota.controller.ts
replaceInFile('src/modules/billing/controllers/quota.controller.ts', [
  [/let upsell: any = null;/g, "let upsell: Record<string, unknown> | null = null;"]
]);

// 17. campaign.controller.ts
replaceInFile('src/modules/campaign/campaign.controller.ts', [
  [/const result = await this\.campaignService\.create/g, "const result: any = await this.campaignService.create"],
  [/const result = await this\.campaignService\.pause/g, "const result: any = await this.campaignService.pause"],
  [/const result = await this\.campaignService\.resume/g, "const result: any = await this.campaignService.resume"]
]);

// 18. conversation.controller.ts
replaceInFile('src/modules/conversation/conversation.controller.ts', [
  [/const \{ data, meta \} = await this\.conversationService\.getConversations/g, "const { data, meta }: any = await this.conversationService.getConversations"]
]);

// 19. follow-up.controller.ts
replaceInFile('src/modules/follow-up/follow-up.controller.ts', [
  [/const \{ data, meta \} = await this\.followUpService\.getFollowUps/g, "const { data, meta }: any = await this.followUpService.getFollowUps"]
]);

// 20. lead.controller.ts
replaceInFile('src/modules/lead/lead.controller.ts', [
  [/const \{ data, meta \} = await this\.hotLeadService\.getLeads/g, "const { data, meta }: any = await this.hotLeadService.getLeads"]
]);

// 21. webhook.service.ts
replaceInFile('src/webhook/webhook.service.ts', [
  [/const payload: Record<string, unknown> = /g, "const payload: any = "]
]);

console.log('Script execution complete.');
