import { ApiProperty } from '@nestjs/swagger';

export class StockResponseDto {
  @ApiProperty({ description: 'ID único de la acción', example: 'stock-123' })
  id: string;

  @ApiProperty({
    description: 'Símbolo de la acción (ticker)',
    example: 'AAPL',
  })
  symbol: string;

  @ApiProperty({
    description: 'Nombre completo de la acción',
    example: 'Apple Inc.',
  })
  name: string;

  @ApiProperty({ description: 'Precio actual de la acción', example: 150.5 })
  price: number;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del precio',
    example: '2024-12-04T10:00:00Z',
  })
  updatedAt: Date;
}
