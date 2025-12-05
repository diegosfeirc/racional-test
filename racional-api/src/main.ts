import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Racional API')
    .setDescription('API para gestión de portafolios y órdenes de acciones')
    .setVersion('1.0')
    .addTag('app', 'Endpoints generales de la aplicación')
    .addTag('users', 'Operaciones relacionadas con usuarios')
    .addTag('stocks', 'Operaciones relacionadas con acciones')
    .addTag('portfolios', 'Operaciones relacionadas con portafolios')
    .addTag('orders', 'Operaciones relacionadas con órdenes')
    .addTag('transactions', 'Operaciones relacionadas con transacciones')
    .addTag('wallets', 'Operaciones relacionadas con billeteras')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
