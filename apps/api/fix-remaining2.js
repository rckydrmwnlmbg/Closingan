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

// 1. conversation.service.ts
replaceInFile('src/modules/conversation/conversation.service.ts', [
  [/import \{ Conversation \} from '@prisma\/client';/g, "import { Conversation, ConversationState, AiMode, SenderType, HeatTier } from '@prisma/client';"],
  [/state: any;/g, 'state: ConversationState;'],
  [/aiMode: any;/g, 'aiMode: AiMode;'],
  [/lastSenderType: any;/g, 'lastSenderType: SenderType;'],
  [/heatTier: any;/g, 'heatTier: HeatTier;'],
  [/aiMode: any\)/g, 'aiMode: AiMode)']
]);

// 2. follow-up.service.ts
replaceInFile('src/modules/follow-up/follow-up.service.ts', [
  [/return JSON\.parse\(cachedData\);/g, "return JSON.parse(cachedData) as { data: any[]; meta: { nextCursor: string | null; hasNext: boolean } };"]
]);

// 3. hot-lead.service.ts
replaceInFile('src/modules/lead/hot-lead.service.ts', [
  [/return JSON\.parse\(cachedData\);/g, "return JSON.parse(cachedData) as { data: any[]; meta: { nextCursor: string | null; hasNext: boolean } };"],
  [/this\.checkAndTriggerAlert\(tenantId, lead, updatedLead\);/g, "void this.checkAndTriggerAlert(tenantId, lead, updatedLead);"]
]);

// 4. webhook.service.ts
replaceInFile('src/webhook/webhook.service.ts', [
  [/return JSON\.parse\(cachedData\);/g, "return JSON.parse(cachedData) as any;"] // or remove if not applicable
]);

// 5. billing/services/quota.service.ts
replaceInFile('src/modules/billing/services/quota.service.ts', [
  [/error instanceof Error \? error\.message : error\.message/g, "error instanceof Error ? error.message : String(error)"], // example, we will just use regex to replace all error.message accesses
  [/error\.message/g, "(error instanceof Error ? error.message : String(error))"],
  [/error\.stack/g, "(error instanceof Error ? error.stack : undefined)"]
]);

// 6. campaign.controller.ts
replaceInFile('src/modules/campaign/campaign.controller.ts', [
  [/@Req\(\) req: any/g, "@Req() req: Request & { user: { id: string, tenantId: string } }"],
  [/@Req\(\) req/g, "@Req() req: Request & { user: { id: string, tenantId: string } }"],
  [/import \{ Req \} from '@nestjs\/common';/g, "import { Req } from '@nestjs/common';\nimport type { Request } from 'express';"],
  [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"],
  [/this\.cls\.get\('user'\)/g, "this.cls.get<{ userId: string, tenantId: string }>('user')"]
]);

// 7. users.controller.ts
replaceInFile('src/modules/users/users.controller.ts', [
  [/@Request\(\) req: Request & \{ user: \{ id: string \} \}, @Body\(\) updateDto: UpdateUserDto/g, "@Request() req: Request & { user: { id: string } },\n    @Body() updateDto: UpdateUserDto"],
  [/@Request\(\) req: Request & \{ user: \{ id: string \} \}, @Body\(\) dto: ChangePasswordDto/g, "@Request() req: Request & { user: { id: string } },\n    @Body() dto: ChangePasswordDto"]
]);

// 8. conversation.repository.ts
replaceInFile('src/modules/conversation/conversation.repository.ts', [
  [/const where: Prisma\.ConversationWhereInput = \{[\s\S]*?\};/g, `const where: Prisma.ConversationWhereInput = {
      tenantId,
      isArchived: false,
    };`]
]);

console.log('Script execution complete.');
