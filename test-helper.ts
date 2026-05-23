const fs = require('fs');

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
const randomNum1 = Math.floor(Math.random() * 100000000);
webStr = webStr.replace(/webhook999@example\.com/g, `webhook${randomNum1}@example.com`);
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
const randomNum2 = Math.floor(Math.random() * 100000000);
waStr = waStr.replace(/wa999@example\.com/g, `wa${randomNum2}@example.com`);
waStr = waStr.replace(/wa_test_\d*@example\.com/g, `wa${randomNum2}@example.com`);
waStr = waStr.replace(/wa.*@example\.com/g, `wa${randomNum2}@example.com`); // Catch all just in case
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);
