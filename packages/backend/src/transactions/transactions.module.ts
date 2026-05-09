import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { sdkProviders } from '../common/sdk.provider';

@Module({
  controllers: [TransactionsController],
  providers: [...sdkProviders],
})
export class TransactionsModule {}
