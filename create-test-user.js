const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@princip.com' },
      update: {},
      create: {
        email: 'admin@princip.com',
        passwordHash: adminPassword,
        name: 'Admin Korisnik',
        role: 'ADMIN',
        emailVerified: true,
        qrData: JSON.stringify({ userId: 'admin' }),
        membership: {
          create: {
            active: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            plan: 'Yearly',
            type: 'VIP'
          }
        }
      }
    });

    console.log('✅ Admin kreiran:', admin.email, '/ lozinka: admin123');

    // Create regular user
    const userPassword = await bcrypt.hash('test123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        passwordHash: userPassword,
        name: 'Test Korisnik',
        role: 'USER',
        emailVerified: true,
        qrData: JSON.stringify({ userId: 'test' }),
        membership: {
          create: {
            active: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            plan: 'Monthly',
            type: 'Basic'
          }
        }
      }
    });

    console.log('✅ Korisnik kreiran:', user.email, '/ lozinka: test123');

  } catch (error) {
    console.error('Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();