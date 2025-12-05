import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { OrderType } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  portfolioId: string;

  @IsString()
  @IsNotEmpty()
  stockId: string;

  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0.01)
  unitPrice: number;
}
