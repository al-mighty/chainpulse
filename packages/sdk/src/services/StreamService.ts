import 'reflect-metadata';
import { injectable, multiInject, inject } from 'inversify';
import { Observable, merge, scan, map, EMPTY, catchError, shareReplay } from 'rxjs';
import { TYPES, CHAIN_META } from '../constants';
import type { IChainProvider, Portfolio, ChainPortfolio } from '../types';
import { PriceService } from './PriceService';

interface ChainUpdate {
  chainId: string;
  portfolio: ChainPortfolio;
}

@injectable()
export class StreamService {
  constructor(
    @multiInject(TYPES.ChainProvider) private providers: IChainProvider[],
    @inject(TYPES.PriceService) private priceService: PriceService,
  ) {}

  portfolioStream(address: string): Observable<Portfolio> {
    const streams = this.providers
      .filter(p => p.isValidAddress(address))
      .map(provider => this.createChainStream(provider, address));

    if (streams.length === 0) return EMPTY;

    const initial: Portfolio = {
      address,
      totalUsdValue: 0,
      chains: {},
      updatedAt: Date.now(),
    };

    return merge(...streams).pipe(
      scan((portfolio, update: ChainUpdate) => {
        const chains = { ...portfolio.chains, [update.chainId]: update.portfolio };
        const totalUsdValue = Object.values(chains).reduce((sum, c) => sum + c.totalUsdValue, 0);
        return { ...portfolio, chains, totalUsdValue, updatedAt: Date.now() };
      }, initial),
      shareReplay(1),
    );
  }

  private createChainStream(provider: IChainProvider, address: string): Observable<ChainUpdate> {
    const meta = CHAIN_META[provider.chainId];

    return provider.subscribeToBalanceChanges(address).pipe(
      map(balances => {
        const pricedBalances = balances.map(b => ({ ...b, usdValue: 0 }));
        const chainPortfolio: ChainPortfolio = {
          chainId: provider.chainId,
          balances: pricedBalances,
          totalUsdValue: 0,
        };
        return { chainId: provider.chainId, portfolio: chainPortfolio } as ChainUpdate;
      }),
      catchError(err => {
        console.error(`[StreamService] ${meta.name} stream error:`, err);
        return EMPTY;
      }),
    );
  }
}
