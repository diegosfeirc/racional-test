import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';
import { Prisma } from '@prisma/client';
import { dollarsToCents, centsToDollars } from '../common/utils/currency.utils';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createStockDto: CreateStockDto): Promise<StockResponseDto> {
    try {
      const priceInCents = dollarsToCents(createStockDto.price);
      const stock = await this.prisma.stock.create({
        data: {
          symbol: createStockDto.symbol,
          name: createStockDto.name,
          price: priceInCents,
        },
      });

      this.logger.log(`Stock created: ${stock.id} (${stock.symbol})`);
      return this.mapToResponseDto(stock);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(
            `Stock symbol already exists: ${createStockDto.symbol}`,
          );
          throw new ConflictException('Stock symbol already exists');
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error creating stock', error.message);
        throw error;
      }
      this.logger.error('Error creating stock', 'Unknown error');
      throw new Error('Failed to create stock');
    }
  }

  async findAll(): Promise<StockResponseDto[]> {
    const stocks = await this.prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
    });

    return stocks.map((stock) => this.mapToResponseDto(stock));
  }

  async findOne(id: string): Promise<StockResponseDto> {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return this.mapToResponseDto(stock);
  }

  async findBySymbol(symbol: string): Promise<StockResponseDto> {
    const stock = await this.prisma.stock.findUnique({
      where: { symbol },
    });

    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    return this.mapToResponseDto(stock);
  }

  async update(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    try {
      const updateData: {
        symbol?: string;
        name?: string;
        price?: bigint;
      } = {};
      if (updateStockDto.symbol) updateData.symbol = updateStockDto.symbol;
      if (updateStockDto.name) updateData.name = updateStockDto.name;
      if (updateStockDto.price !== undefined) {
        updateData.price = dollarsToCents(updateStockDto.price);
      }

      const stock = await this.prisma.stock.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Stock updated: ${id} (${stock.symbol})`);
      return this.mapToResponseDto(stock);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Stock with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          this.logger.warn(
            `Stock symbol already exists: ${updateStockDto.symbol ?? 'unknown'}`,
          );
          throw new ConflictException('Stock symbol already exists');
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error updating stock', error.message);
        throw error;
      }
      this.logger.error('Error updating stock', 'Unknown error');
      throw new Error('Failed to update stock');
    }
  }

  private mapToResponseDto(stock: {
    id: string;
    symbol: string;
    name: string;
    price: bigint;
    createdAt: Date;
    updatedAt: Date;
  }): StockResponseDto {
    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      price: centsToDollars(stock.price),
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    };
  }
}
