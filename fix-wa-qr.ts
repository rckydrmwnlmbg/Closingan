const fs = require('fs');

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
waStr = waStr.replace(/\/v1\/whatsapp\//g, '/whatsapp/');
waStr = waStr.replace(/\/v1\/webhook\//g, '/webhook/');
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
webStr = webStr.replace(/\/v1\/webhook\//g, '/webhook/');
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);
