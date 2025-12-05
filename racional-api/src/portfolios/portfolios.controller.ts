import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioResponseDto } from './dto/portfolio-response.dto';
import { PortfolioTotalResponseDto } from './dto/portfolio-total-response.dto';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get('user/:userId')
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<PortfolioResponseDto[]> {
    return this.portfoliosService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PortfolioResponseDto> {
    return this.portfoliosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.update(id, updatePortfolioDto);
  }

  @Get(':id/total')
  async getTotalByPortfolioId(
    @Param('id') id: string,
  ): Promise<PortfolioTotalResponseDto> {
    return this.portfoliosService.getTotalByPortfolioId(id);
  }
}
