import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioResponseDto } from './dto/portfolio-response.dto';
import { PortfolioTotalResponseDto } from './dto/portfolio-total-response.dto';
import { Prisma } from '@prisma/client';
import { centsToDollars } from '../common/utils/currency.utils';

@Injectable()
export class PortfoliosService {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createForUser(
    userId: string,
    name: string,
  ): Promise<PortfolioResponseDto> {
    try {
      const portfolio = await this.prisma.portfolio.create({
        data: {
          userId,
          name,
        },
      });

      this.logger.log(
        `Portfolio created for user: ${userId} with name: ${name}`,
      );
      return this.mapToResponseDto(portfolio);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A portfolio with the name "${name}" already exists for this user`,
          );
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error creating portfolio', error.message);
        throw error;
      }
      this.logger.error('Error creating portfolio', 'Unknown error');
      throw new Error('Failed to create portfolio');
    }
  }

  async create(
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    try {
      // Verify user exists before creating portfolio
      const user = await this.prisma.user.findUnique({
        where: { id: createPortfolioDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createPortfolioDto.userId} not found`,
        );
      }

      const portfolio = await this.prisma.portfolio.create({
        data: {
          userId: createPortfolioDto.userId,
          name: createPortfolioDto.name,
          ...(createPortfolioDto.description && {
            description: createPortfolioDto.description,
          }),
        },
      });

      this.logger.log(
        `Portfolio created: ${portfolio.id} for user ${createPortfolioDto.userId} with name: ${createPortfolioDto.name}`,
      );
      return this.mapToResponseDto(portfolio);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(
            `User with ID ${createPortfolioDto.userId} not found`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A portfolio with the name "${createPortfolioDto.name}" already exists for this user`,
          );
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error creating portfolio', error.message);
        throw error;
      }
      this.logger.error('Error creating portfolio', 'Unknown error');
      throw new Error('Failed to create portfolio');
    }
  }

  async findAllByUserId(userId: string): Promise<PortfolioResponseDto[]> {
    const portfolios = await this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return portfolios.map((portfolio) => this.mapToResponseDto(portfolio));
  }

  async findOne(id: string): Promise<PortfolioResponseDto> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }

    return this.mapToResponseDto(portfolio);
  }

  async update(
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    try {
      const existingPortfolio = await this.prisma.portfolio.findUnique({
        where: { id },
      });

      if (!existingPortfolio) {
        throw new NotFoundException(`Portfolio with ID ${id} not found`);
      }

      if (updatePortfolioDto.name) {
        const duplicatePortfolio = await this.prisma.portfolio.findFirst({
          where: {
            userId: existingPortfolio.userId,
            name: updatePortfolioDto.name,
            id: { not: id },
          },
        });

        if (duplicatePortfolio) {
          throw new ConflictException(
            `A portfolio with the name "${updatePortfolioDto.name}" already exists for this user`,
          );
        }
      }

      const portfolio = await this.prisma.portfolio.update({
        where: { id },
        data: {
          ...(updatePortfolioDto.name && { name: updatePortfolioDto.name }),
          ...(updatePortfolioDto.description !== undefined && {
            description: updatePortfolioDto.description,
          }),
        },
      });

      this.logger.log(`Portfolio updated: ${id}`);
      return this.mapToResponseDto(portfolio);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Portfolio with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A portfolio with this name already exists for this user`,
          );
        }
      }
      if (error instanceof Error) {
        this.logger.error('Error updating portfolio', error.message);
        throw error;
      }
      this.logger.error('Error updating portfolio', 'Unknown error');
      throw new Error('Failed to update portfolio');
    }
  }

  async getTotalByPortfolioId(
    portfolioId: string,
  ): Promise<PortfolioTotalResponseDto> {
    const portfolio = await this.findOne(portfolioId);

    const holdings = await this.prisma.portfolioHolding.findMany({
      where: { portfolioId: portfolio.id },
      include: {
        stock: true,
      },
    });

    const holdingsWithValue = holdings.map((holding) => {
      const currentPrice = centsToDollars(Number(holding.stock.price));
      const quantity = Number(holding.quantity);
      const currentValue = quantity * currentPrice;

      return {
        stockId: holding.stockId,
        stockSymbol: holding.stock.symbol,
        stockName: holding.stock.name,
        quantity: quantity,
        averageBuyPrice: centsToDollars(Number(holding.averageBuyPrice)),
        currentPrice: currentPrice,
        currentValue: currentValue,
      };
    });

    const totalValue = holdingsWithValue.reduce(
      (sum, holding) => sum + holding.currentValue,
      0,
    );

    return {
      portfolioId: portfolio.id,
      userId: portfolio.userId,
      totalValue: totalValue,
      holdings: holdingsWithValue,
    };
  }

  private mapToResponseDto(portfolio: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PortfolioResponseDto {
    return {
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      description: portfolio.description,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  }
}
