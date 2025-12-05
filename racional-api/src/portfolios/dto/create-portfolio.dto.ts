import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'ID del usuario propietario del portafolio',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Nombre del portafolio',
    example: 'Portafolio Principal',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Descripción opcional del portafolio',
    example: 'Portafolio de inversión a largo plazo',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
