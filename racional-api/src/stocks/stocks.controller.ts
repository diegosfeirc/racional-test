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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';

@ApiTags('stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva acción',
    description: 'Registra una nueva acción en el sistema',
  })
  @ApiBody({ type: CreateStockDto })
  @ApiResponse({
    status: 201,
    description: 'Acción creada exitosamente',
    type: StockResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El símbolo ya está registrado' })
  async create(
    @Body(ValidationPipe) createStockDto: CreateStockDto,
  ): Promise<StockResponseDto> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las acciones',
    description: 'Retorna una lista de todas las acciones disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones',
    type: [StockResponseDto],
  })
  async findAll(): Promise<StockResponseDto[]> {
    return this.stocksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una acción por ID',
    description: 'Retorna la información de una acción específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la acción',
    example: 'stock-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción encontrada',
    type: StockResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async findOne(@Param('id') id: string): Promise<StockResponseDto> {
    return this.stocksService.findOne(id);
  }

  @Get('symbol/:symbol')
  @ApiOperation({
    summary: 'Obtener una acción por símbolo',
    description:
      'Retorna la información de una acción por su símbolo (ej: AAPL, MSFT)',
  })
  @ApiParam({
    name: 'symbol',
    description: 'Símbolo de la acción',
    example: 'AAPL',
  })
  @ApiResponse({
    status: 200,
    description: 'Acción encontrada',
    type: StockResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async findBySymbol(
    @Param('symbol') symbol: string,
  ): Promise<StockResponseDto> {
    return this.stocksService.findBySymbol(symbol);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una acción',
    description: 'Actualiza la información de una acción existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la acción',
    example: 'stock-123',
  })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: 200,
    description: 'Acción actualizada exitosamente',
    type: StockResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStockDto: UpdateStockDto,
  ): Promise<StockResponseDto> {
    return this.stocksService.update(id, updateStockDto);
  }
}
