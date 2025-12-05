import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
