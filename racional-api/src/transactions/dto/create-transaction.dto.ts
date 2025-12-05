import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Tipo de transacción',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    description: 'Monto de la transacción',
    example: 1000.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Fecha de la transacción en formato ISO 8601',
    example: '2024-12-04T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Descripción opcional de la transacción',
    example: 'Depósito inicial',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
