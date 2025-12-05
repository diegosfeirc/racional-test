import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, OrderType } from '@prisma/client';

export enum MovementType {
  TRANSACTION = 'TRANSACTION',
  ORDER = 'ORDER',
}

export class MovementResponseDto {
  @ApiProperty({ description: 'ID del movimiento', example: 'movement-123' })
  id: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.TRANSACTION,
  })
  type: MovementType;

  @ApiProperty({
    description: 'Fecha del movimiento',
    example: '2024-12-04T10:00:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Descripción del movimiento',
    example: 'Depósito inicial',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Monto (solo para transacciones)',
    example: 1000.0,
    required: false,
  })
  amount?: number;

  @ApiProperty({
    description: 'Tipo de transacción (solo para transacciones)',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
    required: false,
  })
  transactionType?: TransactionType;

  @ApiProperty({
    description: 'Tipo de orden (solo para órdenes)',
    enum: OrderType,
    example: OrderType.BUY,
    required: false,
  })
  orderType?: OrderType;

  @ApiProperty({
    description: 'Símbolo de la acción (solo para órdenes)',
    example: 'AAPL',
    required: false,
  })
  stockSymbol?: string;

  @ApiProperty({
    description: 'Nombre de la acción (solo para órdenes)',
    example: 'Apple Inc.',
    required: false,
  })
  stockName?: string;

  @ApiProperty({
    description: 'Cantidad de acciones (solo para órdenes)',
    example: 10,
    required: false,
  })
  quantity?: number;

  @ApiProperty({
    description: 'Precio unitario (solo para órdenes)',
    example: 150.5,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    description: 'Total de la orden (solo para órdenes)',
    example: 1505.0,
    required: false,
  })
  total?: number;
}
