/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = 'admin@qrivo.dev';
  const password = await bcrypt.hash('Password123', 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'Qrivo Admin', email: adminEmail, passwordHash: password, role: 'ADMIN', emailVerified: true },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
