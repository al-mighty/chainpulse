import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioGateway } from './portfolio.gateway';
import { sdkProviders } from '../common/sdk.provider';

@Module({
  controllers: [PortfolioController],
  providers: [...sdkProviders, PortfolioGateway],
})
export class PortfolioModule {}
