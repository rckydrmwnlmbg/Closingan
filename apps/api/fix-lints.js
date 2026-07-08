const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. conversation.gateway.ts
replaceInFile(
  path.join(__dirname, 'src/modules/websocket/conversation.gateway.ts'),
  [
    [/afterInit\(_server: Server\) {/g, 'afterInit() {'],
    [
      /const payload = \(await this\.jwtService\.verifyAsync\(token, \{[\s\S]*?\}\)\) as \{ tenantId: string; sub: string \};/g,
      `const payload = await this.jwtService.verifyAsync<{ tenantId: string; sub: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
      });`
    ],
    [/client\.data = client\.data \|\| \{\};/g, 'client.data = (client.data as Record<string, unknown>) || {};'],
    [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"],
    [/this\.cls\.get\('user'\)/g, "this.cls.get<Record<string, unknown>>('user')"]
  ]
);

// 2. jwt-ws.guard.ts
replaceInFile(
  path.join(__dirname, 'src/modules/websocket/guards/jwt-ws.guard.ts'),
  [
    [/client\.data = client\.data \|\| \{\};/g, 'client.data = (client.data as Record<string, unknown>) || {};'],
    [
      /return \(\n\s*\(client\.handshake\.auth\?\.token as string\) \|\|\n\s*\(client\.handshake\.query\?\.token as string\)\n\s*\);/g,
      `return (
      (client.handshake.auth as Record<string, unknown>)?.token as string ||
      (client.handshake.query as Record<string, unknown>)?.token as string
    );`
    ],
    [
      /return \(\n\s*\(client\.handshake\.auth\?\.token\) \|\|\n\s*\(client\.handshake\.query\?\.token\)\n\s*\) as string;/g,
      `return (
      (client.handshake.auth as Record<string, unknown>)?.token as string ||
      (client.handshake.query as Record<string, unknown>)?.token as string
    );`
    ],
    [
      /return \(\n\s*client\.handshake\.auth\?\.token \|\|\n\s*client\.handshake\.query\?\.token\n\s*\) as string;/g,
      `return (
      (client.handshake.auth as Record<string, unknown>)?.token as string ||
      (client.handshake.query as Record<string, unknown>)?.token as string
    );`
    ],
    [
      /return \(\(client\.handshake\.auth\?\.token as string\) \|\| \(client\.handshake\.query\?\.token as string\)\);/g,
      `return (
      (client.handshake.auth as Record<string, unknown>)?.token as string ||
      (client.handshake.query as Record<string, unknown>)?.token as string
    );`
    ]
  ]
);

// 3. whatsapp.controller.ts
replaceInFile(
  path.join(__dirname, 'src/whatsapp/controllers/whatsapp.controller.ts'),
  [
    [/this\.cls\.get\('tenantId'\)/g, "this.cls.get<string>('tenantId')"]
  ]
);

// 4. fonnte.service.ts
replaceInFile(
  path.join(__dirname, 'src/whatsapp/providers/fonnte.service.ts'),
  [
    [
      /const response = await firstValueFrom\(\n\s*this\.httpService\n\s*\.post<\n\s*\{\n\s*status: boolean;\n\s*url\?: string;\n\s*reason\?: string;\n\s*\}\n\s*>\(/g,
      `const response = await firstValueFrom<
        AxiosResponse<{
          status: boolean;
          url?: string;
          reason?: string;
        }>
      >(
        this.httpService
          .post<{
            status: boolean;
            url?: string;
            reason?: string;
          }>(`
    ],
    [
      /const response = await firstValueFrom\(\n\s*this\.httpService\n\s*\.post<FonnteDeviceResponse>\(/g,
      `const response = await firstValueFrom<AxiosResponse<FonnteDeviceResponse>>(
        this.httpService
          .post<FonnteDeviceResponse>(`
    ],
    [
      /\) as any\n\s*\.pipe\(/g,
      `)
          .pipe(`
    ]
  ]
);

// 5. webhook.controller.ts
replaceInFile(
  path.join(__dirname, 'src/webhook/webhook.controller.ts'),
  [
    [/@Req\(\) req: Request & \{ rawBody\?: Buffer \},/g, '@Req() req: Request & { rawBody?: Buffer },'],
    [/const rawBody = req\.rawBody \? req\.rawBody\.toString\(\) : undefined;/g, 'const rawBody = req.rawBody ? req.rawBody.toString() : undefined;']
  ]
);

// Remove unused imports in other files
replaceInFile(
  path.join(__dirname, 'src/modules/lead/queue/hot-lead.processor.ts'),
  [
    [/, OnModuleDestroy/g, '']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/modules/lead/queue/ai-analysis.processor.ts'),
  [
    [/async onFailed\(job: Job, error: Error\) \{/g, 'onFailed(job: Job, error: Error) {']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/modules/settings/settings.dto.ts'),
  [
    [/IsArray, /g, '']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/modules/settings/settings.service.ts'),
  [
    [/NotFoundException, /g, '']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/modules/users/users.dto.ts'),
  [
    [/, IsEnum/g, ''],
    [/import \{ UserRole \} from '@prisma\/client';\n/g, '']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/webhook/webhook.service.ts'),
  [
    [/payload: any/g, 'payload: Record<string, unknown>']
  ]
);

replaceInFile(
  path.join(__dirname, 'src/modules/users/users.controller.ts'),
  [
    [/const adminId = this\.cls\.get\('user'\)\.userId;/g, 'const adminId = this.cls.get<{userId: string}>("user").userId;']
  ]
);

console.log('Script execution complete.');
