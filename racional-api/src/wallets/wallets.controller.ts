import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletResponseDto } from './dto/wallet-response.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<WalletResponseDto> {
    return this.walletsService.findByUserId(userId);
  }

  @Get('user/:userId/balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(
    @Param('userId') userId: string,
  ): Promise<{ balance: number }> {
    const balance = await this.walletsService.getBalance(userId);
    return { balance };
  }
}
