import { PrismaClient, Stock } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Datos iniciales para el seed
 */
const SEED_DATA = {
  user: {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'usuario@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  wallet: {
    id: '9f8e7d6c-5b4a-3210-fedc-ba9876543210',
    userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    balance: 0,
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  portfolio: {
    id: '2a3b4c5d-6e7f-8091-a2b3-c4d5e6f70819',
    userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Mi portafolio',
    description: 'Portafolio de inversión a largo plazo',
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  stocks: [
    {
      id: '87654321-fedc-b987-6543-210fedcba987',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 150500,
      createdAt: new Date('2024-12-04T10:00:00Z'),
      updatedAt: new Date('2024-12-04T10:00:00Z'),
    },
    {
      id: '10293847-5645-3421-a0b9-c8d7e6f54321',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 175500,
      createdAt: new Date('2024-12-04T10:00:00Z'),
      updatedAt: new Date('2024-12-04T10:00:00Z'),
    },
    {
      id: '7c8d9e0f-1a2b-3c4d-5e6f-7890fedcba98',
      symbol: 'META',
      name: 'Meta Inc.',
      price: 215500,
      createdAt: new Date('2024-12-04T10:00:00Z'),
      updatedAt: new Date('2024-12-04T10:00:00Z'),
    },
  ],
};

/**
 * Función principal para ejecutar los seeds
 */
async function main(): Promise<void> {
  console.log('🌱 Iniciando seeds...\n');

  try {
    // 1. Crear o actualizar usuario
    console.log('📝 Creando usuario...');
    const user = await prisma.user.upsert({
      where: { id: SEED_DATA.user.id },
      update: {
        email: SEED_DATA.user.email,
        firstName: SEED_DATA.user.firstName,
        lastName: SEED_DATA.user.lastName,
        updatedAt: SEED_DATA.user.updatedAt,
      },
      create: SEED_DATA.user,
    });
    console.log(`✅ Usuario creado/actualizado: ${user.email} (${user.id})\n`);

    // 2. Crear o actualizar wallet para el usuario
    console.log('💰 Creando wallet...');
    const wallet = await prisma.wallet.upsert({
      where: { userId: SEED_DATA.wallet.userId },
      update: {
        balance: SEED_DATA.wallet.balance,
        updatedAt: SEED_DATA.wallet.updatedAt,
      },
      create: SEED_DATA.wallet,
    });
    const balanceInDollars = Number(wallet.balance) / 100;
    console.log(
      `✅ Wallet creada/actualizada: ${wallet.id} (Balance: $${balanceInDollars.toFixed(2)})\n`,
    );

    // 3. Crear o actualizar portafolio para el usuario
    console.log('📊 Creando portafolio...');
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId: SEED_DATA.portfolio.userId,
        name: SEED_DATA.portfolio.name,
      },
    });

    const portfolio = existingPortfolio
      ? await prisma.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            description: SEED_DATA.portfolio.description,
            updatedAt: SEED_DATA.portfolio.updatedAt,
          },
        })
      : await prisma.portfolio.create({
          data: SEED_DATA.portfolio,
        });
    console.log(
      `✅ Portafolio creado/actualizado: ${portfolio.name} (${portfolio.id})\n`,
    );

    // 4. Crear o actualizar stocks
    console.log('📈 Creando stocks...');
    const createdStocks: Stock[] = [];
    for (const stockData of SEED_DATA.stocks) {
      const stock = await prisma.stock.upsert({
        where: { id: stockData.id },
        update: {
          symbol: stockData.symbol,
          name: stockData.name,
          price: stockData.price,
          updatedAt: stockData.updatedAt,
        },
        create: stockData,
      });
      createdStocks.push(stock);
      const priceInDollars = Number(stock.price) / 100;
      console.log(
        `  ✅ ${stock.symbol} - ${stock.name} ($${priceInDollars.toFixed(2)})`,
      );
    }
    console.log(`\n✅ ${createdStocks.length} stocks creados/actualizados\n`);

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Seeds ejecutados correctamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const finalBalanceInDollars = Number(wallet.balance) / 100;
    console.log(`👤 Usuario: ${user.email}`);
    console.log(
      `💰 Wallet: ${wallet.id} (Balance: $${finalBalanceInDollars.toFixed(2)})`,
    );
    console.log(`📊 Portafolio: ${portfolio.name}`);
    console.log(`📈 Stocks: ${createdStocks.length} stocks`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Ejecutar seeds y manejar la desconexión
 */
main()
  .catch((error) => {
    console.error('❌ Error fatal en seeds:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  });
