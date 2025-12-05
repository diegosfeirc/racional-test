import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
