import { PrismaClient, Stock } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Datos iniciales para el seed
 */
const SEED_DATA = {
  user: {
    id: 'user-123',
    email: 'usuario@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  wallet: {
    id: 'wallet-123',
    userId: 'user-123',
    balance: 0,
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  portfolio: {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Mi portafolio',
    description: 'Portafolio de inversión a largo plazo',
    createdAt: new Date('2024-12-04T10:00:00Z'),
    updatedAt: new Date('2024-12-04T10:00:00Z'),
  },
  stocks: [
    {
      id: 'stock-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 150.5,
      createdAt: new Date('2024-12-04T10:00:00Z'),
      updatedAt: new Date('2024-12-04T10:00:00Z'),
    },
    {
      id: 'stock-2',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 175.5,
      createdAt: new Date('2024-12-04T10:00:00Z'),
      updatedAt: new Date('2024-12-04T10:00:00Z'),
    },
    {
      id: 'stock-3',
      symbol: 'META',
      name: 'Meta Inc.',
      price: 215.5,
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
    console.log(
      `✅ Wallet creada/actualizada: ${wallet.id} (Balance: $${wallet.balance.toString()})\n`,
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
      console.log(
        `  ✅ ${stock.symbol} - ${stock.name} ($${stock.price.toString()})`,
      );
    }
    console.log(`\n✅ ${createdStocks.length} stocks creados/actualizados\n`);

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Seeds ejecutados correctamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Usuario: ${user.email}`);
    console.log(
      `💰 Wallet: ${wallet.id} (Balance: $${wallet.balance.toString()})`,
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
