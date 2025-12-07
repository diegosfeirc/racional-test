import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty({
    description: 'Símbolo de la acción (ticker)',
    example: 'AAPL',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  symbol: string;

  @ApiProperty({
    description: 'Nombre completo de la acción',
    example: 'Apple Inc.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Precio actual de la acción',
    example: 150.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
