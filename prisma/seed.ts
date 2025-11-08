// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists:', adminEmail);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Created admin:', admin.email);
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
  }

  // Create sample reseller (optional)
  const resellerEmail = process.env.RESELLER_EMAIL;
  const resellerPassword = process.env.RESELLER_PASSWORD;
  
  if (resellerEmail && resellerPassword) {
    const existingReseller = await prisma.admin.findUnique({
      where: { email: resellerEmail },
    });

    if (existingReseller) {
      console.log('✅ Reseller already exists:', resellerEmail);
    } else {
      const hashedPassword = await bcrypt.hash(resellerPassword, 12);

      const reseller = await prisma.admin.create({
        data: {
          email: resellerEmail,
          password: hashedPassword,
          name: 'Reseller',
          role: 'RESELLER',
        },
      });

      console.log('✅ Created reseller:', reseller.email);
      console.log('📧 Email:', resellerEmail);
      console.log('🔑 Password:', resellerPassword);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

