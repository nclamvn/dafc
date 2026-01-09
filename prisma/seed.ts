import { PrismaClient, UserRole, UserStatus, BudgetStatus, OTBPlanStatus, OTBVersionType, SKUProposalStatus, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with rich mock data...\n');

  // 1. Create Divisions
  console.log('Creating divisions...');
  const divisions = await Promise.all([
    prisma.division.upsert({
      where: { code: 'FASHION' },
      update: {},
      create: { name: 'Fashion', code: 'FASHION', description: 'Luxury fashion brands', sortOrder: 1 },
    }),
    prisma.division.upsert({
      where: { code: 'LIFESTYLE' },
      update: {},
      create: { name: 'Lifestyle', code: 'LIFESTYLE', description: 'Premium lifestyle brands', sortOrder: 2 },
    }),
    prisma.division.upsert({
      where: { code: 'SPORTS' },
      update: {},
      create: { name: 'Sports', code: 'SPORTS', description: 'Sports & Athletic brands', sortOrder: 3 },
    }),
  ]);

  const fashionDiv = divisions.find(d => d.code === 'FASHION')!;
  const lifestyleDiv = divisions.find(d => d.code === 'LIFESTYLE')!;
  const sportsDiv = divisions.find(d => d.code === 'SPORTS')!;

  // 2. Create Brands
  console.log('Creating brands...');
  const brands = await Promise.all([
    // Fashion Division
    prisma.brand.upsert({
      where: { code: 'FERR' },
      update: {},
      create: { name: 'Ferragamo', code: 'FERR', description: 'Italian luxury fashion house', divisionId: fashionDiv.id, sortOrder: 1 },
    }),
    prisma.brand.upsert({
      where: { code: 'BURB' },
      update: {},
      create: { name: 'Burberry', code: 'BURB', description: 'British luxury fashion house', divisionId: fashionDiv.id, sortOrder: 2 },
    }),
    prisma.brand.upsert({
      where: { code: 'MAXM' },
      update: {},
      create: { name: 'Max Mara', code: 'MAXM', description: 'Italian fashion house', divisionId: fashionDiv.id, sortOrder: 3 },
    }),
    prisma.brand.upsert({
      where: { code: 'TODS' },
      update: {},
      create: { name: "Tod's", code: 'TODS', description: 'Italian luxury shoes & accessories', divisionId: fashionDiv.id, sortOrder: 4 },
    }),
    // Lifestyle Division
    prisma.brand.upsert({
      where: { code: 'BOSS' },
      update: {},
      create: { name: 'Hugo Boss', code: 'BOSS', description: 'German luxury fashion', divisionId: lifestyleDiv.id, sortOrder: 1 },
    }),
    prisma.brand.upsert({
      where: { code: 'POLO' },
      update: {},
      create: { name: 'Polo Ralph Lauren', code: 'POLO', description: 'American fashion brand', divisionId: lifestyleDiv.id, sortOrder: 2 },
    }),
    prisma.brand.upsert({
      where: { code: 'LAUR' },
      update: {},
      create: { name: 'Ralph Lauren', code: 'LAUR', description: 'American designer brand', divisionId: lifestyleDiv.id, sortOrder: 3 },
    }),
    // Sports Division
    prisma.brand.upsert({
      where: { code: 'COLU' },
      update: {},
      create: { name: 'Columbia', code: 'COLU', description: 'American outdoor brand', divisionId: sportsDiv.id, sortOrder: 1 },
    }),
    prisma.brand.upsert({
      where: { code: 'LACO' },
      update: {},
      create: { name: 'Lacoste', code: 'LACO', description: 'French sports casual brand', divisionId: sportsDiv.id, sortOrder: 2 },
    }),
    prisma.brand.upsert({
      where: { code: 'SAMS' },
      update: {},
      create: { name: 'Samsonite', code: 'SAMS', description: 'Travel & luggage brand', divisionId: sportsDiv.id, sortOrder: 3 },
    }),
  ]);

  // 3. Create Categories & Subcategories
  console.log('Creating categories...');
  const categoriesData = [
    { name: 'Bags', code: 'BAGS', subs: ['Tote', 'Crossbody', 'Shoulder', 'Clutch', 'Backpack', 'Hobo', 'Travel'] },
    { name: 'Shoes', code: 'SHOES', subs: ['Loafers', 'Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Oxfords', 'Moccasins'] },
    { name: 'Ready-to-Wear', code: 'RTW', subs: ['Jackets', 'Coats', 'Dresses', 'Tops', 'Pants', 'Skirts', 'Suits', 'Knitwear'] },
    { name: 'Accessories', code: 'ACC', subs: ['Belts', 'Scarves', 'Sunglasses', 'Jewelry', 'Watches', 'Hats', 'Ties'] },
    { name: 'Small Leather Goods', code: 'SLG', subs: ['Wallets', 'Card Holders', 'Key Holders', 'Pouches', 'Phone Cases', 'Passport Holders'] },
  ];

  const categories: Record<string, typeof prisma.category.$inferSelect> = {};
  const subcategories: Record<string, typeof prisma.subcategory.$inferSelect> = {};

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { code: cat.code },
      update: {},
      create: { name: cat.name, code: cat.code, sortOrder: categoriesData.indexOf(cat) + 1 },
    });
    categories[cat.code] = category;

    for (let i = 0; i < cat.subs.length; i++) {
      const subCode = `${cat.code}-${cat.subs[i].toUpperCase().replace(/\s+/g, '-').substring(0, 4)}`;
      const sub = await prisma.subcategory.upsert({
        where: { categoryId_code: { categoryId: category.id, code: subCode } },
        update: {},
        create: { name: cat.subs[i], code: subCode, categoryId: category.id, sortOrder: i + 1 },
      });
      subcategories[subCode] = sub;
    }
  }

  // 4. Create Locations
  console.log('Creating locations...');
  const locations = await Promise.all([
    prisma.salesLocation.upsert({
      where: { code: 'HCM-VL' },
      update: {},
      create: { name: 'Vincom Le Thanh Ton', code: 'HCM-VL', type: 'STORE', address: 'District 1, HCMC', sortOrder: 1 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'HCM-SC' },
      update: {},
      create: { name: 'Saigon Centre', code: 'HCM-SC', type: 'STORE', address: 'District 1, HCMC', sortOrder: 2 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'HCM-TK' },
      update: {},
      create: { name: 'Takashimaya', code: 'HCM-TK', type: 'STORE', address: 'District 1, HCMC', sortOrder: 3 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'HN-TM' },
      update: {},
      create: { name: 'Trang Tien Plaza', code: 'HN-TM', type: 'STORE', address: 'Hoan Kiem, Hanoi', sortOrder: 4 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'HN-LM' },
      update: {},
      create: { name: 'Lotte Mall Hanoi', code: 'HN-LM', type: 'STORE', address: 'Ba Dinh, Hanoi', sortOrder: 5 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'DN-VM' },
      update: {},
      create: { name: 'Vincom Da Nang', code: 'DN-VM', type: 'STORE', address: 'Hai Chau, Da Nang', sortOrder: 6 },
    }),
    prisma.salesLocation.upsert({
      where: { code: 'ONLINE' },
      update: {},
      create: { name: 'E-Commerce', code: 'ONLINE', type: 'ONLINE', sortOrder: 10 },
    }),
  ]);

  // 5. Create Seasons
  console.log('Creating seasons...');
  const seasons = await Promise.all([
    prisma.season.upsert({
      where: { code: 'SS25' },
      update: { isCurrent: true },
      create: { name: 'Spring/Summer 2025', code: 'SS25', seasonGroup: 'SS', year: 2025, startDate: new Date('2025-02-01'), endDate: new Date('2025-07-31'), isCurrent: true },
    }),
    prisma.season.upsert({
      where: { code: 'FW25' },
      update: {},
      create: { name: 'Fall/Winter 2025', code: 'FW25', seasonGroup: 'FW', year: 2025, startDate: new Date('2025-08-01'), endDate: new Date('2026-01-31') },
    }),
    prisma.season.upsert({
      where: { code: 'SS24' },
      update: { isActive: false },
      create: { name: 'Spring/Summer 2024', code: 'SS24', seasonGroup: 'SS', year: 2024, startDate: new Date('2024-02-01'), endDate: new Date('2024-07-31'), isActive: false },
    }),
    prisma.season.upsert({
      where: { code: 'FW24' },
      update: { isActive: false },
      create: { name: 'Fall/Winter 2024', code: 'FW24', seasonGroup: 'FW', year: 2024, startDate: new Date('2024-08-01'), endDate: new Date('2025-01-31'), isActive: false },
    }),
  ]);

  const ss25 = seasons.find(s => s.code === 'SS25')!;

  // 6. Create Demo Users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('Demo@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dafc.com' },
    update: {},
    create: { email: 'admin@dafc.com', name: 'Admin User', password: hashedPassword, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
  });

  await Promise.all([
    prisma.user.upsert({
      where: { email: 'finance.head@dafc.com' },
      update: {},
      create: { email: 'finance.head@dafc.com', name: 'Nguyen Van Finance', password: hashedPassword, role: UserRole.FINANCE_HEAD, status: UserStatus.ACTIVE },
    }),
    prisma.user.upsert({
      where: { email: 'finance@dafc.com' },
      update: {},
      create: { email: 'finance@dafc.com', name: 'Tran Thi Finance', password: hashedPassword, role: UserRole.FINANCE_USER, status: UserStatus.ACTIVE },
    }),
    prisma.user.upsert({
      where: { email: 'merchandise@dafc.com' },
      update: {},
      create: { email: 'merchandise@dafc.com', name: 'Le Van Merchandise', password: hashedPassword, role: UserRole.MERCHANDISE_LEAD, status: UserStatus.ACTIVE },
    }),
    prisma.user.upsert({
      where: { email: 'bod@dafc.com' },
      update: {},
      create: { email: 'bod@dafc.com', name: 'Pham Thi BOD', password: hashedPassword, role: UserRole.BOD_MEMBER, status: UserStatus.ACTIVE },
    }),
  ]);

  const ferragamo = brands.find(b => b.code === 'FERR')!;
  const burberry = brands.find(b => b.code === 'BURB')!;
  const maxmara = brands.find(b => b.code === 'MAXM')!;
  const hugoboss = brands.find(b => b.code === 'BOSS')!;

  await prisma.user.upsert({
    where: { email: 'ferragamo.mgr@dafc.com' },
    update: {},
    create: {
      email: 'ferragamo.mgr@dafc.com', name: 'Ferragamo Brand Manager', password: hashedPassword, role: UserRole.BRAND_MANAGER, status: UserStatus.ACTIVE,
      assignedBrands: { connect: [{ id: ferragamo.id }] },
    },
  });

  await prisma.user.upsert({
    where: { email: 'burberry.mgr@dafc.com' },
    update: {},
    create: {
      email: 'burberry.mgr@dafc.com', name: 'Burberry Brand Manager', password: hashedPassword, role: UserRole.BRAND_MANAGER, status: UserStatus.ACTIVE,
      assignedBrands: { connect: [{ id: burberry.id }] },
    },
  });

  // 7. Create Budget Allocations
  console.log('Creating budget allocations...');
  const mainLocation = locations.find(l => l.code === 'HCM-VL')!;

  const budgetData = [
    { brand: ferragamo, budget: 2500000 },
    { brand: burberry, budget: 3200000 },
    { brand: maxmara, budget: 1800000 },
    { brand: hugoboss, budget: 2100000 },
  ];

  const budgets: typeof prisma.budgetAllocation.$inferSelect[] = [];
  for (const bd of budgetData) {
    const budget = await prisma.budgetAllocation.upsert({
      where: { seasonId_brandId_locationId_version: { seasonId: ss25.id, brandId: bd.brand.id, locationId: mainLocation.id, version: 1 } },
      update: {},
      create: {
        seasonId: ss25.id,
        brandId: bd.brand.id,
        locationId: mainLocation.id,
        totalBudget: bd.budget,
        seasonalBudget: bd.budget * 0.7,
        replenishmentBudget: bd.budget * 0.3,
        status: BudgetStatus.APPROVED,
        createdById: adminUser.id,
        approvedById: adminUser.id,
        approvedAt: new Date(),
      },
    });
    budgets.push(budget);
  }

  // 8. Create OTB Plans
  console.log('Creating OTB plans...');
  const ferragamoBudget = budgets.find(b => b.brandId === ferragamo.id)!;

  const otbPlan = await prisma.oTBPlan.upsert({
    where: { budgetId_version: { budgetId: ferragamoBudget.id, version: 1 } },
    update: {},
    create: {
      budgetId: ferragamoBudget.id,
      seasonId: ss25.id,
      brandId: ferragamo.id,
      version: 1,
      versionType: OTBVersionType.V1_USER,
      status: OTBPlanStatus.APPROVED,
      totalOTBValue: 2500000,
      totalSKUCount: 150,
      aiConfidenceScore: 0.85,
      createdById: adminUser.id,
      approvedById: adminUser.id,
      approvedAt: new Date(),
    },
  });

  // 9. Create OTB Line Items
  console.log('Creating OTB line items...');
  const lineItemsData = [
    { category: 'BAGS', pct: 35, value: 875000, hist: 32, conf: 0.9 },
    { category: 'SHOES', pct: 30, value: 750000, hist: 28, conf: 0.88 },
    { category: 'RTW', pct: 15, value: 375000, hist: 18, conf: 0.82 },
    { category: 'ACC', pct: 12, value: 300000, hist: 14, conf: 0.85 },
    { category: 'SLG', pct: 8, value: 200000, hist: 8, conf: 0.91 },
  ];

  for (const item of lineItemsData) {
    const cat = categories[item.category];
    await prisma.oTBLineItem.create({
      data: {
        otbPlanId: otbPlan.id,
        level: 1,
        categoryId: cat.id,
        historicalSalesPct: item.hist,
        systemProposedPct: item.pct - 2,
        systemConfidence: item.conf,
        userBuyPct: item.pct,
        userBuyValue: item.value,
        varianceFromSystem: 2,
        varianceFromHist: item.pct - item.hist,
      },
    });
  }

  // 10. Create SKU Proposals with Items
  console.log('Creating SKU proposals...');
  const skuProposal = await prisma.sKUProposal.create({
    data: {
      otbPlanId: otbPlan.id,
      seasonId: ss25.id,
      brandId: ferragamo.id,
      status: SKUProposalStatus.VALIDATED,
      totalSKUs: 50,
      validSKUs: 48,
      errorSKUs: 0,
      warningSKUs: 2,
      totalValue: 875000,
      totalUnits: 1200,
      createdById: adminUser.id,
    },
  });

  // Create sample SKU items
  const skuItems = [
    { code: 'FERR-BAG-001', name: 'Gancini Tote Medium', cat: 'BAGS', sub: 'BAGS-TOTE', gender: Gender.WOMEN, retail: 2150, cost: 860, qty: 25 },
    { code: 'FERR-BAG-002', name: 'Studio Box Crossbody', cat: 'BAGS', sub: 'BAGS-CROS', gender: Gender.WOMEN, retail: 1650, cost: 660, qty: 30 },
    { code: 'FERR-BAG-003', name: 'Trifolio Shoulder Bag', cat: 'BAGS', sub: 'BAGS-SHOU', gender: Gender.WOMEN, retail: 1890, cost: 756, qty: 20 },
    { code: 'FERR-SHO-001', name: 'Gancini Loafer', cat: 'SHOES', sub: 'SHOES-LOAF', gender: Gender.MEN, retail: 850, cost: 340, qty: 40 },
    { code: 'FERR-SHO-002', name: 'Vara Bow Pump', cat: 'SHOES', sub: 'SHOES-HEEL', gender: Gender.WOMEN, retail: 750, cost: 300, qty: 35 },
    { code: 'FERR-SHO-003', name: 'Reversible Belt', cat: 'ACC', sub: 'ACC-BELT', gender: Gender.MEN, retail: 450, cost: 180, qty: 50 },
    { code: 'FERR-SLG-001', name: 'Gancini Wallet', cat: 'SLG', sub: 'SLG-WALL', gender: Gender.UNISEX, retail: 550, cost: 220, qty: 45 },
    { code: 'FERR-SLG-002', name: 'Card Holder', cat: 'SLG', sub: 'SLG-CARD', gender: Gender.UNISEX, retail: 295, cost: 118, qty: 60 },
  ];

  for (const sku of skuItems) {
    const cat = categories[sku.cat];
    const margin = ((sku.retail - sku.cost) / sku.retail * 100);
    await prisma.sKUItem.create({
      data: {
        proposalId: skuProposal.id,
        skuCode: sku.code,
        styleName: sku.name,
        gender: sku.gender,
        categoryId: cat.id,
        retailPrice: sku.retail,
        costPrice: sku.cost,
        margin: margin,
        orderQuantity: sku.qty,
        orderValue: sku.retail * sku.qty,
        validationStatus: 'VALID',
        aiDemandScore: Math.random() * 30 + 70,
        aiDemandPrediction: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
      },
    });
  }

  // 11. Create Collections
  console.log('Creating collections...');
  await Promise.all([
    prisma.collection.upsert({
      where: { brandId_code: { brandId: ferragamo.id, code: 'SS25-MAIN' } },
      update: {},
      create: { name: 'SS25 Main Collection', code: 'SS25-MAIN', brandId: ferragamo.id, sortOrder: 1 },
    }),
    prisma.collection.upsert({
      where: { brandId_code: { brandId: ferragamo.id, code: 'SS25-CAPSULE' } },
      update: {},
      create: { name: 'SS25 Capsule Collection', code: 'SS25-CAPSULE', brandId: ferragamo.id, sortOrder: 2 },
    }),
    prisma.collection.upsert({
      where: { brandId_code: { brandId: burberry.id, code: 'SS25-MAIN' } },
      update: {},
      create: { name: 'SS25 Main Collection', code: 'SS25-MAIN', brandId: burberry.id, sortOrder: 1 },
    }),
  ]);

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📋 Demo Accounts (password: Demo@123):');
  console.log('   - admin@dafc.com (Admin)');
  console.log('   - finance.head@dafc.com (Finance Head)');
  console.log('   - ferragamo.mgr@dafc.com (Brand Manager - Ferragamo)');
  console.log('   - burberry.mgr@dafc.com (Brand Manager - Burberry)');
  console.log('   - merchandise@dafc.com (Merchandise Lead)');
  console.log('   - bod@dafc.com (BOD Member)');
  console.log('\n📊 Data Created:');
  console.log('   - 3 Divisions, 10 Brands');
  console.log('   - 5 Categories, 38 Subcategories');
  console.log('   - 7 Locations');
  console.log('   - 4 Seasons');
  console.log('   - 4 Budget Allocations (SS25)');
  console.log('   - 1 OTB Plan with Line Items');
  console.log('   - 1 SKU Proposal with 8 Items');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
