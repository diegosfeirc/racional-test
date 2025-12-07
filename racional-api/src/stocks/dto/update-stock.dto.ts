import {
  IsString,
  IsNumber,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Símbolo de la acción (ticker)',
    example: 'AAPL',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  symbol?: string;

  @ApiProperty({
    description: 'Nombre completo de la acción',
    example: 'Apple Inc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Precio actual de la acción',
    example: 150.5,
    minimum: 0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  price?: number;
}
