const fs = require('fs');

let waStr = fs.readFileSync('apps/api/test/e2e/wa-qr-flow.e2e-spec.ts', 'utf8');
waStr = waStr.replace(/\/v1\/webhook\/fonnte/g, '/v1/webhook/whatsapp');
fs.writeFileSync('apps/api/test/e2e/wa-qr-flow.e2e-spec.ts', waStr);

let webStr = fs.readFileSync('apps/api/test/e2e/webhook-conversation-ai.e2e-spec.ts', 'utf8');
webStr = webStr.replace(/\/v1\/webhook\/fonnte/g, '/v1/webhook/whatsapp');
fs.writeFileSync('apps/api/test/e2e/webhook-conversation-ai.e2e-spec.ts', webStr);

let s1 = fs.readFileSync('apps/api/src/whatsapp/controllers/whatsapp.controller.ts', 'utf8');
s1 = s1.replace("@Controller('v1/whatsapp')", "@Controller('whatsapp')");
fs.writeFileSync('apps/api/src/whatsapp/controllers/whatsapp.controller.ts', s1);

let s2 = fs.readFileSync('apps/api/src/webhook/webhook.controller.ts', 'utf8');
s2 = s2.replace("@Controller('v1/webhook')", "@Controller('webhook')");
fs.writeFileSync('apps/api/src/webhook/webhook.controller.ts', s2);
