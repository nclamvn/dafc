import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Divisions
  const divisions = await Promise.all([
    prisma.division.upsert({
      where: { code: 'FASHION' },
      update: {},
      create: { name: 'Fashion', code: 'FASHION', description: 'Luxury fashion brands', sortOrder: 1 },
    }),
    prisma.division.upsert({
      where: { code: 'TIMELESS' },
      update: {},
      create: { name: 'Timeless', code: 'TIMELESS', description: 'Classic lifestyle brands', sortOrder: 2 },
    }),
    prisma.division.upsert({
      where: { code: 'LIFESTYLE' },
      update: {},
      create: { name: 'Lifestyle', code: 'LIFESTYLE', description: 'Modern lifestyle brands', sortOrder: 3 },
    }),
  ]);
  console.log('Divisions created');

  // 2. Create Brands
  const fashionDiv = divisions.find(d => d.code === 'FASHION')!;
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { code: 'FERR' },
      update: {},
      create: {
        name: 'Ferragamo',
        code: 'FERR',
        description: 'Italian luxury fashion house',
        divisionId: fashionDiv.id,
        sortOrder: 1,
      },
    }),
    prisma.brand.upsert({
      where: { code: 'BURB' },
      update: {},
      create: {
        name: 'Burberry',
        code: 'BURB',
        description: 'British luxury fashion house',
        divisionId: fashionDiv.id,
        sortOrder: 2,
      },
    }),
  ]);
  console.log('Brands created');

  // 3. Create Categories & Subcategories
  const categoriesData = [
    { name: 'Bags', code: 'BAGS', subs: ['Tote', 'Crossbody', 'Shoulder', 'Clutch', 'Backpack', 'Hobo'] },
    { name: 'Shoes', code: 'SHOES', subs: ['Loafers', 'Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Oxfords'] },
    { name: 'Ready-to-Wear', code: 'RTW', subs: ['Jackets', 'Coats', 'Dresses', 'Tops', 'Pants', 'Skirts', 'Suits'] },
    { name: 'Accessories', code: 'ACC', subs: ['Belts', 'Scarves', 'Sunglasses', 'Jewelry', 'Watches', 'Hats'] },
    { name: 'Small Leather Goods', code: 'SLG', subs: ['Wallets', 'Card Holders', 'Key Holders', 'Pouches', 'Phone Cases'] },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { code: cat.code },
      update: {},
      create: { name: cat.name, code: cat.code, sortOrder: categoriesData.indexOf(cat) + 1 },
    });

    for (let i = 0; i < cat.subs.length; i++) {
      const subCode = `${cat.code}-${cat.subs[i].toUpperCase().replace(/\s+/g, '-').substring(0, 4)}`;
      await prisma.subcategory.upsert({
        where: { categoryId_code: { categoryId: category.id, code: subCode } },
        update: {},
        create: {
          name: cat.subs[i],
          code: subCode,
          categoryId: category.id,
          sortOrder: i + 1,
        },
      });
    }
  }
  console.log('Categories & Subcategories created');

  // 4. Create Locations
  await Promise.all([
    prisma.salesLocation.upsert({
      where: { code: 'HCM' },
      update: {},
      create: { name: 'Ho Chi Minh City', code: 'HCM', type: 'STORE', address: 'District 1, HCMC', sortOrder: 1 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'HN' },
      update: {},
      create: { name: 'Hanoi', code: 'HN', type: 'STORE', address: 'Hoan Kiem, Hanoi', sortOrder: 2 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'DN' },
      update: {},
      create: { name: 'Da Nang', code: 'DN', type: 'STORE', address: 'Hai Chau, Da Nang', sortOrder: 3 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'ONLINE' },
      update: {},
      create: { name: 'Online Store', code: 'ONLINE', type: 'ONLINE', sortOrder: 4 },
    }),
  ]);
  console.log('Locations created');

  // 5. Create Seasons
  await Promise.all([
    prisma.season.upsert({
      where: { code: 'SS25' },
      update: {},
      create: {
        name: 'Spring/Summer 2025',
        code: 'SS25',
        seasonGroup: 'SS',
        year: 2025,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-07-31'),
        isCurrent: true,
      },
    }),
    prisma.season.upsert({
      where: { code: 'FW25' },
      update: {},
      create: {
        name: 'Fall/Winter 2025',
        code: 'FW25',
        seasonGroup: 'FW',
        year: 2025,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2026-01-31'),
        isCurrent: false,
      },
    }),
    prisma.season.upsert({
      where: { code: 'SS24' },
      update: {},
      create: {
        name: 'Spring/Summer 2024',
        code: 'SS24',
        seasonGroup: 'SS',
        year: 2024,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        isActive: false,
      },
    }),
  ]);
  console.log('Seasons created');

  // 6. Create Demo Users
  const hashedPassword = await bcrypt.hash('Demo@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@dafc.com' },
    update: {},
    create: {
      email: 'admin@dafc.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'finance.head@dafc.com' },
    update: {},
    create: {
      email: 'finance.head@dafc.com',
      name: 'Finance Head',
      password: hashedPassword,
      role: UserRole.FINANCE_HEAD,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'finance@dafc.com' },
    update: {},
    create: {
      email: 'finance@dafc.com',
      name: 'Finance User',
      password: hashedPassword,
      role: UserRole.FINANCE_USER,
      status: UserStatus.ACTIVE,
    },
  });

  const ferragamoBrand = brands.find(b => b.code === 'FERR')!;
  const burberryBrand = brands.find(b => b.code === 'BURB')!;

  await prisma.user.upsert({
    where: { email: 'ferragamo.mgr@dafc.com' },
    update: {},
    create: {
      email: 'ferragamo.mgr@dafc.com',
      name: 'Ferragamo Brand Manager',
      password: hashedPassword,
      role: UserRole.BRAND_MANAGER,
      status: UserStatus.ACTIVE,
      assignedBrands: {
        connect: [{ id: ferragamoBrand.id }],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'burberry.mgr@dafc.com' },
    update: {},
    create: {
      email: 'burberry.mgr@dafc.com',
      name: 'Burberry Brand Manager',
      password: hashedPassword,
      role: UserRole.BRAND_MANAGER,
      status: UserStatus.ACTIVE,
      assignedBrands: {
        connect: [{ id: burberryBrand.id }],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'merchandise@dafc.com' },
    update: {},
    create: {
      email: 'merchandise@dafc.com',
      name: 'Merchandise Lead',
      password: hashedPassword,
      role: UserRole.MERCHANDISE_LEAD,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bod@dafc.com' },
    update: {},
    create: {
      email: 'bod@dafc.com',
      name: 'BOD Member',
      password: hashedPassword,
      role: UserRole.BOD_MEMBER,
      status: UserStatus.ACTIVE,
    },
  });
  console.log('Users created');

  console.log('');
  console.log('Seeding completed!');
  console.log('');
  console.log('Demo accounts (password: Demo@123):');
  console.log('   - admin@dafc.com (Admin)');
  console.log('   - finance.head@dafc.com (Finance Head)');
  console.log('   - finance@dafc.com (Finance User)');
  console.log('   - ferragamo.mgr@dafc.com (Brand Manager - Ferragamo)');
  console.log('   - burberry.mgr@dafc.com (Brand Manager - Burberry)');
  console.log('   - merchandise@dafc.com (Merchandise Lead)');
  console.log('   - bod@dafc.com (BOD Member)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
