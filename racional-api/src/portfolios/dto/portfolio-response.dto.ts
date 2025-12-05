import { ApiProperty } from '@nestjs/swagger';

export class PortfolioResponseDto {
  @ApiProperty({
    description: 'ID único del portafolio',
    example: 'portfolio-123',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre del portafolio',
    example: 'Portafolio Principal',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del portafolio',
    example: 'Portafolio de inversión a largo plazo',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Fecha de creación del portafolio',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del portafolio',
    example: '2024-12-04T10:00:00Z',
  })
  updatedAt: Date;
}
