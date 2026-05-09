import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { Container } from 'inversify';
import { TYPES } from '@chainpulse/sdk';
import type { IChainProvider, Transaction } from '@chainpulse/sdk';

@Controller('tx')
export class TransactionsController {
  constructor(@Inject('SDK_CONTAINER') private readonly container: Container) {}

  @Get(':address')
  async getTransactions(
    @Param('address') address: string,
    @Query('chain') chain?: string,
    @Query('limit') limit = '20',
  ) {
    const providers = this.container.getAll<IChainProvider>(TYPES.ChainProvider);
    const targetProviders = chain
      ? providers.filter(p => p.chainId === chain)
      : providers.filter(p => p.isValidAddress(address));

    const results = await Promise.allSettled(
      targetProviders.map(async (p) => {
        const txs = await p.getTransactions(address, parseInt(limit, 10));
        return txs;
      }),
    );

    const txs = results
      .filter((r): r is PromiseFulfilledResult<Transaction[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);

    return txs;
  }
}
