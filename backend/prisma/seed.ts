import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = 'admin@qrivo.dev';
  const demoEmail = 'demo@qrivo.dev';
  const password = await bcrypt.hash('Password123', 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'Qrivo Admin', email: adminEmail, passwordHash: password, role: 'ADMIN', emailVerified: true },
  });

  const demo = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: { name: 'Qrivo Demo', email: demoEmail, passwordHash: password, role: 'USER', emailVerified: true },
  });

  // A sample dynamic URL QR for the demo user (idempotent by code).
  await prisma.qRCode.upsert({
    where: { code: 'DEMO1234' },
    update: {},
    create: {
      name: 'Qrivo Website',
      code: 'DEMO1234',
      type: 'URL',
      userId: demo.id,
      content: { create: { url: 'https://example.com' } },
      customization: { create: {} },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete. Admin:', adminEmail, '| Demo:', demoEmail, '| Password: Password123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
