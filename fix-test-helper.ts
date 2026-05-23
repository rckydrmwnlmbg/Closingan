const fs = require('fs');
const properDelete = `
  await prisma.auditLog.deleteMany({});
  await prisma.escalationLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.whatsappSession.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.otpCode.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.tokenQuota.deleteMany({});
  await prisma.tenant.deleteMany({});
`;
let str = fs.readFileSync('apps/api/test/test-helper.ts', 'utf8');
str = str.replace(/await prisma\.\$transaction\(\[[\s\S]*\]\);/g, properDelete);
fs.writeFileSync('apps/api/test/test-helper.ts', str);
