import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
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
    description: 'Cantidad de acciones',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario de la acción',
    example: 150.5,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  unitPrice: number;
}
