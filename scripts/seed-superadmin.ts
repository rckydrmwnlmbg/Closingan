import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL || 'admin@closingan.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'ClosinganSuperAdmin!2026';

  const existingAdmin = await prisma.systemAdmin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`[!] Super Admin with email ${email} already exists.`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.systemAdmin.create({
    data: {
      email,
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`[✔] Super Admin created successfully: ${email}`);
  console.log(`[!] Please change this password in production if using default!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
