import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({
    description: 'Balance actual de la billetera del usuario',
    example: 10000.5,
    type: Number,
  })
  balance: number;
}
