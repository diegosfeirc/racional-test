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
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createStockDto: CreateStockDto,
  ): Promise<StockResponseDto> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  async findAll(): Promise<StockResponseDto[]> {
    return this.stocksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<StockResponseDto> {
    return this.stocksService.findOne(id);
  }

  @Get('symbol/:symbol')
  async findBySymbol(
    @Param('symbol') symbol: string,
  ): Promise<StockResponseDto> {
    return this.stocksService.findBySymbol(symbol);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStockDto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    return this.stocksService.update(id, updateStockDto);
  }
}
