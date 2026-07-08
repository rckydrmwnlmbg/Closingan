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

// 1. jwt-auth.guard.ts
replaceInFile('src/common/guards/jwt-auth.guard.ts', [
  [/UnauthorizedException,/g, ""],
  [/const user = request\.user;/g, "const user = request.user as { tenantId?: string, userId?: string } | undefined;"],
  [/info: unknown,/g, ""],
  [/handleRequest\([\s\S]*?err: Error \| null,[\s\S]*?user: Record<string, unknown> \| false,[\s\S]*?info: unknown,[\s\S]*?\)/g, "handleRequest(err: Error | null, user: Record<string, unknown> | false)"]
]);

// 2. http-metrics.interceptor.ts
replaceInFile('src/common/interceptors/http-metrics.interceptor.ts', [
  [/this\.metricsService\.incrementRequest\(method, path\);/g, "void this.metricsService.incrementRequest(method, path);"],
  [/this\.metricsService\.observeLatency\(method, path, latency\);/g, "void this.metricsService.observeLatency(method, path, latency);"]
]);

// 3. prisma.service.ts
replaceInFile('src/common/prisma/prisma.service.ts', [
  [/const \{ AppException \} = require\('\.\.\/exceptions\/app\.exception'\);/g, ""],
  [/import \{ PrismaClient \} from '@prisma\/client';/g, "import { PrismaClient } from '@prisma/client';\nimport { AppException } from '../exceptions/app.exception';"]
]);

// 4. mail.service.ts
replaceInFile('src/mail/mail.service.ts', [
  [/async sendOtp/g, "sendOtp"],
  [/async sendPasswordReset/g, "sendPasswordReset"]
]);

// 5. main.ts
replaceInFile('src/main.ts', [
  [/process\.on\('unhandledRejection', \(reason, promise\) => \{/g, "process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {"],
  [/`Unhandled Rejection at: \$\{promise\}, reason: \$\{reason\}`/g, "`Unhandled Rejection at: ${String(promise)}, reason: ${String(reason)}`"]
]);

// 6. admin.service.ts
replaceInFile('src/modules/admin/admin.service.ts', [
  [/async getAiPerformance/g, "getAiPerformance"]
]);

// 7. admin.controller.ts
replaceInFile('src/modules/admin/admin.controller.ts', [
  [/@Request\(\) req/g, "@Request() req: any"],
  [/req\.user\.userId/g, "(req.user as { userId: string }).userId"]
]);

// 8. analytics.service.ts
replaceInFile('src/modules/analytics/analytics.service.ts', [
  [/import \{ Prisma \} from '@prisma\/client';/g, ""]
]);

// 9. backup.service.ts
replaceInFile('src/modules/backup/backup.service.ts', [
  [/const data = JSON\.parse\(fs\.readFileSync\(backupPath, 'utf8'\)\);/g, "const data = JSON.parse(fs.readFileSync(backupPath, 'utf8')) as Record<string, unknown>[];"]
]);

// 10. quota.controller.ts
replaceInFile('src/modules/billing/controllers/quota.controller.ts', [
  [/Req,/g, ""],
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 11. campaign.controller.ts
replaceInFile('src/modules/campaign/campaign.controller.ts', [
  [/import \{ Req \} from '@nestjs\/common';/g, "import { Request } from 'express';"],
  [/const campaign = await this\.campaignService\.findOne/g, "const campaign: any = await this.campaignService.findOne"],
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 12. conversation.controller.ts
replaceInFile('src/modules/conversation/conversation.controller.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 13. conversation.service.ts
replaceInFile('src/modules/conversation/conversation.service.ts', [
  [/const \{ data, meta \} = await this\.conversationRepository\.findConversations/g, "const { data, meta } = (await this.conversationRepository.findConversations) as any"],
  [/return result;/g, "return result as any;"]
]);

// 14. jwt-ws.guard.ts
replaceInFile('src/modules/websocket/guards/jwt-ws.guard.ts', [
  [/const token = client\.handshake\.auth\?\.token \|\| client\.handshake\.query\?\.token;/g, "const token = (client.handshake.auth as Record<string, string>)?.token || (client.handshake.query as Record<string, string>)?.token;"]
]);

// 15. webhook.service.ts
replaceInFile('src/webhook/webhook.service.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// Remove remaining unused imports
const unusedImportsReplacements = [
  ['src/modules/billing/services/subscription.service.ts', /import \{ SubscriptionPlan \} from '@prisma\/client';/g, ''],
  ['src/modules/device/device.service.ts', /import \{ WaSessionState \} from '@prisma\/client';/g, ''],
  ['src/modules/device/dto/create-device.dto.ts', /IsPhoneNumber,/g, ''],
  ['src/modules/settings/settings.dto.ts', /IsArray,/g, ''],
  ['src/modules/settings/settings.service.ts', /NotFoundException,/g, ''],
  ['src/modules/users/users.dto.ts', /IsEnum,/g, '']
];

for (const [file, search, replace] of unusedImportsReplacements) {
  replaceInFile(file, [[search, replace]]);
}

console.log('Script execution complete.');
