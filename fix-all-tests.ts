const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/api/test/e2e/*.e2e-spec.ts');
files.push('apps/api/test/wa-qr-flow.e2e-spec.ts', 'apps/api/test/webhook-conversation-ai.e2e-spec.ts');

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  // Insert import
  if (!content.includes('cleanDatabase')) {
    let importPath = "'../../test-helper'";
    if (file.includes('apps/api/test/wa-qr-flow.e2e-spec.ts') || file.includes('apps/api/test/webhook-conversation-ai.e2e-spec.ts')) {
        importPath = "'./test-helper'";
    }
    content = content.replace("import { PrismaService } from ", `import { cleanDatabase } from ${importPath};\nimport { PrismaService } from `);
  }

  // Replace deleteMany logic
  const deleteManyRegex = /await\s+prisma\.\w+\.deleteMany\(\{.*\}\);/g;
  content = content.replace(deleteManyRegex, '');

  if (content.includes('await app.init();')) {
     content = content.replace('await app.init();', 'await app.init();\n    await cleanDatabase(prisma);');
  }

  content = content.replace('await app.close();', 'await cleanDatabase(prisma);\n    await app.close();');

  // Make sure we have unique email for all auth registers
  const uniqueEmail = `test_${Math.floor(Math.random()*1000000)}@example.com`;
  content = content.replace(/test@example\.com/g, uniqueEmail);
  content = content.replace(/a@example\.com/g, uniqueEmail.replace('test', 'a'));
  content = content.replace(/b@example\.com/g, uniqueEmail.replace('test', 'b'));
  content = content.replace(/wa_test_\d*@example\.com/g, uniqueEmail.replace('test', 'wa'));
  content = content.replace(/webhook_test_\d*@example\.com/g, uniqueEmail.replace('test', 'webhook'));

  fs.writeFileSync(file, content);
}
