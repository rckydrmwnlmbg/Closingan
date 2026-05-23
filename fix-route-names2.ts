const fs = require('fs');
let s1 = fs.readFileSync('apps/api/src/whatsapp/controllers/whatsapp.controller.ts', 'utf8');
s1 = s1.replace("@Controller('whatsapp')", "@Controller('v1/whatsapp')");
fs.writeFileSync('apps/api/src/whatsapp/controllers/whatsapp.controller.ts', s1);

let s2 = fs.readFileSync('apps/api/src/webhook/webhook.controller.ts', 'utf8');
s2 = s2.replace("@Controller('webhook')", "@Controller('v1/webhook')");
fs.writeFileSync('apps/api/src/webhook/webhook.controller.ts', s2);
