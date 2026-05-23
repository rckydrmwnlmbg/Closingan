const fs = require('fs');

for (const file of ['apps/api/test/wa-qr-flow.e2e-spec.ts', 'apps/api/test/webhook-conversation-ai.e2e-spec.ts']) {
    let content = fs.readFileSync(file, 'utf8');

    const uniqueEmail = `test_${Math.floor(Math.random()*100000)}@example.com`;
    // We already changed to webhook_t_Date... and wa_t_Date... let's catch them all just in case
    content = content.replace(/webhook_t_\d+@example\.com/g, uniqueEmail);
    content = content.replace(/wa_t_\d+@example\.com/g, uniqueEmail);
    fs.writeFileSync(file, content);
}
