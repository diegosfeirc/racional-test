import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [PortfoliosModule, WalletsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
