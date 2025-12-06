import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AppConfig } from '../config/interfaces/config.interface';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<AppConfig>) {
    super({
      datasourceUrl: configService.get<string>('database.url', { infer: true }),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to connect to database', error.message);
        throw error;
      }
      this.logger.error('Failed to connect to database', 'Unknown error');
      throw new Error('Database connection failed');
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Database connection closed');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error disconnecting from database', error.message);
      } else {
        this.logger.error('Error disconnecting from database', 'Unknown error');
      }
    }
  }
}
