const fs = require('fs');

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
waStr = waStr.replace(/wa12@example\.com/g, 'wa13@example.com');
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
webStr = webStr.replace(/webhook12@example\.com/g, 'webhook14@example.com');
webStr = webStr.replace(/webhook3@example\.com/g, 'webhook14@example.com');
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);
