import { PrismaService } from '../src/common/prisma/prisma.service';

export async function cleanDatabase(prisma: PrismaService) {
  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany({}),
      prisma.escalationLog.deleteMany({}),
      prisma.message.deleteMany({}),
      prisma.conversation.deleteMany({}),
      prisma.whatsappSession.deleteMany({}),
      prisma.refreshToken.deleteMany({}),
      prisma.otpCode.deleteMany({}),
      prisma.user.deleteMany({}),
      prisma.subscription.deleteMany({}),
      prisma.tokenQuota.deleteMany({}),
      prisma.tenant.deleteMany({}),
    ]);
  } catch (e) {
    console.warn('Failed to clean database (ok if e2e without db)', e.message);
  }
}
