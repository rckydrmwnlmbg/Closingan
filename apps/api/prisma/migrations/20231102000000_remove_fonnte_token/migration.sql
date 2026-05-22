-- AlterTable
ALTER TABLE "WhatsappSession" DROP COLUMN "fonnteToken";
ALTER TABLE "WhatsappSession" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'FONNTE';
ALTER TABLE "WhatsappSession" ADD COLUMN "providerSessionId" TEXT;
ALTER TABLE "WhatsappSession" ADD COLUMN "providerDeviceId" TEXT;
