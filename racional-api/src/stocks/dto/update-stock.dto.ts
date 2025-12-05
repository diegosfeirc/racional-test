import {
  IsString,
  IsNumber,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateStockDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  symbol?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
