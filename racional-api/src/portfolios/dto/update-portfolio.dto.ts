import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePortfolioDto {
  @ApiProperty({
    description: 'Nombre del portafolio',
    example: 'Portafolio Principal',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Descripción opcional del portafolio',
    example: 'Portafolio de inversión a largo plazo',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
