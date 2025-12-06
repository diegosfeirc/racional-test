import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/interfaces/config.interface';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<AppConfig>>(ConfigService);

  const swaggerConfig = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const portConfig = configService.get<AppConfig['port']>('port');
  if (typeof portConfig !== 'number' || portConfig <= 0) {
    throw new Error(
      'Invalid port configuration. Port must be a positive number.',
    );
  }
  await app.listen(portConfig);

  console.log(`Application is running on: http://localhost:${portConfig}`);
  console.log(`Swagger documentation: http://localhost:${portConfig}/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
