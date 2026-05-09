import 'reflect-metadata';
import { injectable, multiInject, inject } from 'inversify';
import { TYPES, CHAIN_META } from '../constants';
import type { IChainProvider, Portfolio, ChainPortfolio } from '../types';
import { PriceService } from './PriceService';

@injectable()
export class PortfolioService {
  constructor(
    @multiInject(TYPES.ChainProvider) private providers: IChainProvider[],
    @inject(TYPES.PriceService) private priceService: PriceService,
  ) {}

  async getPortfolio(address: string): Promise<Portfolio> {
    const chains: Record<string, ChainPortfolio> = {};
    let totalUsdValue = 0;

    const results = await Promise.allSettled(
      this.providers.map(async (provider) => {
        if (!provider.isValidAddress(address)) return null;

        const balances = await provider.getBalance(address);
        const meta = CHAIN_META[provider.chainId];

        // Get native token price
        const price = await this.priceService.getPrice(meta.coingeckoId);

        const pricedBalances = balances.map(b => ({
          ...b,
          usdValue: b.token.mint === 'native' ? b.uiAmount * price : 0,
        }));

        const chainTotal = pricedBalances.reduce((sum, b) => sum + (b.usdValue || 0), 0);

        return {
          chainId: provider.chainId,
          balances: pricedBalances,
          totalUsdValue: chainTotal,
        } as ChainPortfolio;
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        chains[result.value.chainId] = result.value;
        totalUsdValue += result.value.totalUsdValue;
      }
    }

    return {
      address,
      totalUsdValue,
      chains,
      updatedAt: Date.now(),
    };
  }
}
