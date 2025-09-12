const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Nađi sve korisnike
    const users = await prisma.user.findMany();
    console.log('Pronađeni korisnici:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'bez imena'}) - Role: ${user.role}`);
    });

    if (users.length === 0) {
      console.log('\nNema registrovanih korisnika!');
      console.log('Prvo se registruj na: https://princip-gym-app.vercel.app/register');
      return;
    }

    // Uzmi email prvog korisnika ili pitaj koji
    const firstUser = users[0];
    console.log(`\nPostavljam ${firstUser.email} kao ADMIN...`);
    
    // Ažuriraj ulogu na ADMIN
    const updated = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ Uspešno! ${updated.email} je sada ADMIN`);
    console.log('\nSada možeš da se uloguješ i pristupiš admin panelu na:');
    console.log('https://princip-gym-app.vercel.app/admin');
    
  } catch (error) {
    console.error('Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();