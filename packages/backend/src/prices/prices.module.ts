import { Module } from '@nestjs/common';
import { PricesController } from './prices.controller';
import { sdkProviders } from '../common/sdk.provider';

@Module({
  controllers: [PricesController],
  providers: [...sdkProviders],
})
export class PricesModule {}
