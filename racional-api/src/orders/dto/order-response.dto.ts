import { ApiProperty } from '@nestjs/swagger';
import { OrderType, OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty({ description: 'ID único de la orden', example: 'order-123' })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que creó la orden',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({ description: 'ID de la acción', example: 'stock-789' })
  stockId: string;

  @ApiProperty({
    description: 'Tipo de orden',
    enum: OrderType,
    example: OrderType.BUY,
  })
  type: OrderType;

  @ApiProperty({ description: 'Cantidad de acciones', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Precio unitario de la acción', example: 150.5 })
  unitPrice: number;

  @ApiProperty({
    description: 'Total de la orden (cantidad × precio unitario)',
    example: 1505.0,
  })
  total: number;

  @ApiProperty({
    description: 'Estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Fecha de creación de la orden',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ejecución de la orden',
    example: '2024-12-04T10:05:00Z',
    nullable: true,
  })
  executedAt: Date | null;
}
