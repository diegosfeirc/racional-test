import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({
    description: 'ID único de la billetera',
    example: 'wallet-123',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Balance actual de la billetera',
    example: 10000.5,
  })
  balance: number;

  @ApiProperty({
    description: 'Fecha de creación de la billetera',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del balance',
    example: '2024-12-04T10:00:00Z',
  })
  updatedAt: Date;
}
