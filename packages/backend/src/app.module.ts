import { Module } from '@nestjs/common';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PricesModule } from './prices/prices.module';

@Module({
  imports: [PortfolioModule, TransactionsModule, PricesModule],
})
export class AppModule {}
