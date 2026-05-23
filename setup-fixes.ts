const fs = require('fs');

for (const file of ['apps/api/test/wa-qr-flow.e2e-spec.ts', 'apps/api/test/webhook-conversation-ai.e2e-spec.ts']) {
    let content = fs.readFileSync(file, 'utf8');

    // reset emails to unique ones to prevent unique constraint failures
    const uniqueEmail = `test_${Math.floor(Math.random()*100000)}@example.com`;
    content = content.replace(/wa3*@example\.com/g, uniqueEmail);
    content = content.replace(/webhook3*@example\.com/g, uniqueEmail);
    content = content.replace(/wa@example\.com/g, uniqueEmail);
    content = content.replace(/webhook@example\.com/g, uniqueEmail);
    fs.writeFileSync(file, content);
}
