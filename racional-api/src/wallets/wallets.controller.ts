import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener la billetera de un usuario',
    description:
      'Retorna la información completa de la billetera de un usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Billetera encontrada',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o billetera no encontrada',
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<WalletResponseDto> {
    return this.walletsService.findByUserId(userId);
  }

  @Get('user/:userId/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el balance de un usuario',
    description:
      'Retorna únicamente el balance actual de la billetera del usuario',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance obtenido exitosamente',
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o billetera no encontrada',
  })
  async getBalance(
    @Param('userId') userId: string,
  ): Promise<BalanceResponseDto> {
    const balance = await this.walletsService.getBalance(userId);
    return { balance };
  }
}
