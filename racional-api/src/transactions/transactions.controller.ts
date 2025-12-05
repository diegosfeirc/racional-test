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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva transacción',
    description:
      'Registra una nueva transacción de depósito o retiro para un usuario',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transacción creada exitosamente',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async create(
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener todas las transacciones de un usuario',
    description:
      'Retorna todas las transacciones asociadas a un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de transacciones del usuario',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una transacción por ID',
    description: 'Retorna la información de una transacción específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la transacción',
    example: 'transaction-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Transacción encontrada',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id);
  }
}
