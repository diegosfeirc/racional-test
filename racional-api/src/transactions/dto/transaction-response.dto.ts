import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'ID único de la transacción',
    example: 'transaction-123',
  })
  id: string;

  @ApiProperty({ description: 'ID del usuario', example: 'user-123' })
  userId: string;

  @ApiProperty({
    description: 'Tipo de transacción',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  type: TransactionType;

  @ApiProperty({ description: 'Monto de la transacción', example: 1000.0 })
  amount: number;

  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2024-12-04T10:00:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Descripción de la transacción',
    example: 'Depósito inicial',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;
}
