const fs = require('fs');

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
webStr = webStr.replace(/webhook999@example\.com/g, `wh${Date.now()}@example.com`);
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
waStr = waStr.replace(/wa999@example\.com/g, `wa${Date.now()}@example.com`);
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);

let authStr = fs.readFileSync('apps/api/test/e2e/auth-flow.e2e-spec.ts', 'utf8');
authStr = authStr.replace(/test@example\.com/g, `test${Date.now()}@example.com`);
fs.writeFileSync('apps/api/test/e2e/auth-flow.e2e-spec.ts', authStr);

let tenantStr = fs.readFileSync('apps/api/test/e2e/tenant-isolation.e2e-spec.ts', 'utf8');
tenantStr = tenantStr.replace(/a@example\.com/g, `a${Date.now()}@example.com`);
tenantStr = tenantStr.replace(/b@example\.com/g, `b${Date.now()}@example.com`);
fs.writeFileSync('apps/api/test/e2e/tenant-isolation.e2e-spec.ts', tenantStr);
