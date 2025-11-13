import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed emission rate configurations
  const baseRate = await prisma.emissionRateConfig.upsert({
    where: { rateType: 'BASE' },
    update: {},
    create: {
      rateType: 'BASE',
      emissionRate: 1.0, // 1 point per 1 Bs spent
    },
  });

  const promoRate = await prisma.emissionRateConfig.upsert({
    where: { rateType: 'PROMOTIONAL' },
    update: {},
    create: {
      rateType: 'PROMOTIONAL',
      emissionRate: 1.5, // 1.5 points per 1 Bs spent (50% bonus)
    },
  });

  const starterRate = await prisma.emissionRateConfig.upsert({
    where: { rateType: 'STARTER_PLAN' },
    update: {},
    create: {
      rateType: 'STARTER_PLAN',
      emissionRate: 0.5, // 0.5 points per 1 Bs spent (reduced for starter businesses)
    },
  });

  console.log('✅ Emission rate configs seeded:', {
    baseRate,
    promoRate,
    starterRate,
  });

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
