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

// 1. conversation.repository.ts
replaceInFile('src/modules/conversation/conversation.repository.ts', [
  [/import \{ PrismaService \} from '\.\.\/\.\.\/common\/prisma\/prisma\.service';/g, "import { PrismaService } from '../../common/prisma/prisma.service';\nimport { Prisma } from '@prisma/client';"],
  [/const where: any = \{/g, 'const where: Prisma.ConversationWhereInput = {']
]);

// 2. conversation.service.ts
replaceInFile('src/modules/conversation/conversation.service.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 3. follow-up.controller.ts
replaceInFile('src/modules/follow-up/follow-up.controller.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"],
  [/@CurrentUser\(\) user: any,/g, '@CurrentUser() user: { id: string },']
]);

// 4. follow-up.service.ts
replaceInFile('src/modules/follow-up/follow-up.service.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 5. knowledge.controller.ts
replaceInFile('src/modules/knowledge/knowledge.controller.ts', [
  [/@CurrentUser\(\) user: any/g, '@CurrentUser() user: { tenantId: string }']
]);

// 6. lead.controller.ts
replaceInFile('src/modules/lead/lead.controller.ts', [
  [/import \{ TenantId \} from '\.\.\/\.\.\/common\/decorators\/tenant\.decorator';/g, "import { TenantId } from '../../common/decorators/tenant.decorator';\nimport { HeatTier } from '@prisma/client';"],
  [/@Body\('heatTier'\) heatTier: any,/g, "@Body('heatTier') heatTier: HeatTier,"],
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 7. hot-lead.service.ts
replaceInFile('src/modules/lead/hot-lead.service.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"],
  [/this\.cls\.get\('user'\)/g, "this.cls.get<{ userId: string }>('user')"],
  [/void this\.cls\.run/g, 'this.cls.run'],
  [/this\.cls\.run\(async \(\) =>/g, 'void this.cls.run(async () =>']
]);

// 8. users.controller.ts
replaceInFile('src/modules/users/users.controller.ts', [
  [/@Request\(\) req\)/g, "@Request() req: Request & { user: { id: string } })"],
  [/@Request\(\) req,/g, "@Request() req: Request & { user: { id: string } },"],
  [/import \{ Request \} from 'express';/g, ""],
  [/import \{\n  Controller,/g, "import type { Request } from 'express';\nimport {\n  Controller,"]
]);

// 9. webhook.controller.ts
replaceInFile('src/webhook/webhook.controller.ts', [
  [/  Req,\n\} from '@nestjs\/common';/g, "  Req,\n  Inject,\n} from '@nestjs/common';"]
]);

// 10. webhook.service.ts
replaceInFile('src/webhook/webhook.service.ts', [
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
]);

// 11. jwt-ws.guard.ts
replaceInFile('src/modules/websocket/guards/jwt-ws.guard.ts', [
  [/return \(\n\s*\(client\.handshake\.auth as Record<string, unknown>\)\?\.token as string \|\|\n\s*\(client\.handshake\.query as Record<string, unknown>\)\?\.token as string\n\s*\);/g, "return ((client.handshake.auth as Record<string, string>)?.token || (client.handshake.query as Record<string, string>)?.token) as string;"]
]);

console.log('Script execution complete.');
