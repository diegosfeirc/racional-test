import {
  Controller,
  Get,
  Post,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva orden',
    description: 'Crea una nueva orden de compra o venta de acciones',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Usuario, portafolio o acción no encontrados',
  })
  async create(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener todas las órdenes de un usuario',
    description: 'Retorna todas las órdenes asociadas a un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes del usuario',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una orden por ID',
    description: 'Retorna la información de una orden específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden', example: 'order-123' })
  @ApiResponse({
    status: 200,
    description: 'Orden encontrada',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }
}
