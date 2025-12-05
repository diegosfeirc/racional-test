import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID único del usuario', example: 'user-123' })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  lastName: string;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-12-04T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
    example: '2024-12-04T10:00:00Z',
  })
  updatedAt: Date;
}
