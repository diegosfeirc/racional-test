import { ApiProperty } from '@nestjs/swagger';

export class PortfolioHoldingDto {
  @ApiProperty({ description: 'ID de la acción', example: 'stock-123' })
  stockId: string;

  @ApiProperty({ description: 'Símbolo de la acción', example: 'AAPL' })
  stockSymbol: string;

  @ApiProperty({ description: 'Nombre de la acción', example: 'Apple Inc.' })
  stockName: string;

  @ApiProperty({
    description: 'Cantidad de acciones en el portafolio',
    example: 10,
  })
  quantity: number;

  @ApiProperty({ description: 'Precio promedio de compra', example: 145.5 })
  averageBuyPrice: number;

  @ApiProperty({ description: 'Precio actual de la acción', example: 150.5 })
  currentPrice: number;

  @ApiProperty({
    description: 'Valor actual del holding (cantidad × precio actual)',
    example: 1505.0,
  })
  currentValue: number;
}

export class PortfolioTotalResponseDto {
  @ApiProperty({ description: 'ID del portafolio', example: 'portfolio-123' })
  portfolioId: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Valor total del portafolio (suma de todos los holdings)',
    example: 15050.0,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Lista de holdings del portafolio',
    type: [PortfolioHoldingDto],
  })
  holdings: PortfolioHoldingDto[];
}
