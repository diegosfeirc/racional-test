import { IsEnum, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del usuario que crea la orden',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID del portafolio donde se ejecutará la orden',
    example: 'portfolio-456',
  })
  @IsString()
  @IsNotEmpty()
  portfolioId: string;

  @ApiProperty({
    description: 'ID de la acción',
    example: 'stock-789',
  })
  @IsString()
  @IsNotEmpty()
  stockId: string;

  @ApiProperty({
    description: 'Tipo de orden',
    enum: OrderType,
    example: OrderType.BUY,
  })
  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @ApiProperty({
    description:
      'Monto en dólares a invertir (para compra) o recibir (para venta). La cantidad de acciones se calculará automáticamente según el precio de mercado actual.',
    example: 1505.0,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
