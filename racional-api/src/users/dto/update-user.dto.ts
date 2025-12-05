import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  lastName?: string;
}
