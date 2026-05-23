const fs = require('fs');

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
const ue1 = 'webhook' + Math.floor(Math.random() * 100000) + '@example.com';
webStr = webStr.replace(/webhook999@example\.com/g, ue1);
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
const ue2 = 'wa' + Math.floor(Math.random() * 100000) + '@example.com';
waStr = waStr.replace(/wa999@example\.com/g, ue2);
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);
