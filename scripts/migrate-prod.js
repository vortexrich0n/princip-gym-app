// Ovu skriptu pokreni JEDNOM da ažuriraš produkcijsku bazu
const { PrismaClient } = require('@prisma/client');

async function migrate() {
  console.log('Starting production database migration...');
  
  // Koristi produkcijski DATABASE_URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // Proveri da li polja već postoje
    const testUser = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('emailVerified', 'verificationToken')
    `;

    if (testUser.length === 0) {
      console.log('Adding new columns to User table...');
      
      // Dodaj nova polja
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS "verificationToken" TEXT
      `;
      
      console.log('✅ Columns added successfully');
    } else {
      console.log('✅ Columns already exist');
    }

    // Postavi sve postojeće korisnike kao verifikovane
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "emailVerified" = true 
      WHERE "emailVerified" IS NULL
    `;
    
    console.log('✅ All existing users marked as verified');
    
    // Proveri da li postoje paidAt i paidAmount u Membership
    const testMembership = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Membership' 
      AND column_name IN ('paidAt', 'paidAmount')
    `;

    if (testMembership.length === 0) {
      console.log('Adding payment columns to Membership table...');
      
      await prisma.$executeRaw`
        ALTER TABLE "Membership" 
        ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "paidAmount" DOUBLE PRECISION
      `;
      
      console.log('✅ Payment columns added successfully');
    } else {
      console.log('✅ Payment columns already exist');
    }

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Pokreni migraciju
migrate().catch(console.error);