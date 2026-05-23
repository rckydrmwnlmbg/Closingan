const fs = require('fs');

let waStr = fs.readFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', 'utf8');
if (!waStr.includes("app.setGlobalPrefix('v1')")) {
    waStr = waStr.replace("app = moduleFixture.createNestApplication();", "app = moduleFixture.createNestApplication();\n    app.setGlobalPrefix('v1');");
}
fs.writeFileSync('apps/api/test/wa-qr-flow.e2e-spec.ts', waStr);

let webStr = fs.readFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', 'utf8');
if (!webStr.includes("app.setGlobalPrefix('v1')")) {
    webStr = webStr.replace("app = moduleFixture.createNestApplication();", "app = moduleFixture.createNestApplication();\n    app.setGlobalPrefix('v1');");
}
fs.writeFileSync('apps/api/test/webhook-conversation-ai.e2e-spec.ts', webStr);
