const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeSecondAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@principgym.com' }
    });

    if (!user) {
      console.log('Korisnik admin@principgym.com ne postoji!');
      return;
    }

    const updated = await prisma.user.update({
      where: { email: 'admin@principgym.com' },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ Uspešno! ${updated.email} je sada ADMIN`);
    
  } catch (error) {
    console.error('Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeSecondAdmin();