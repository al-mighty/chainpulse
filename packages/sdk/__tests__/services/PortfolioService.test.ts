import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES, ChainId } from '../../src/constants';
import { PortfolioService } from '../../src/services/PortfolioService';
import { PriceService } from '../../src/services/PriceService';
import { MockChainProvider } from '../mocks/MockChainProvider';
import type { IChainProvider, Balance, ChainPulseConfig } from '../../src/types';

function createTestContainer(providers: MockChainProvider[]): Container {
  const container = new Container();
  const config: ChainPulseConfig = { chains: [ChainId.SOLANA, ChainId.TON] };
  container.bind<ChainPulseConfig>(TYPES.Config).toConstantValue(config);

  for (const p of providers) {
    container.bind<IChainProvider>(TYPES.ChainProvider).toConstantValue(p);
  }

  container.bind<PriceService>(TYPES.PriceService).to(PriceService).inSingletonScope();
  container.bind<PortfolioService>(TYPES.PortfolioService).to(PortfolioService).inSingletonScope();
  return container;
}

const SOL_BALANCE: Balance = {
  token: { symbol: 'SOL', name: 'Solana', mint: 'native', decimals: 9 },
  amount: '2000000000',
  uiAmount: 2.0,
};

const TON_BALANCE: Balance = {
  token: { symbol: 'TON', name: 'Toncoin', mint: 'native', decimals: 9 },
  amount: '5000000000',
  uiAmount: 5.0,
};

describe('PortfolioService', () => {
  it('aggregates balances from multiple chains', async () => {
    const solProvider = new MockChainProvider(ChainId.SOLANA, [SOL_BALANCE]);
    const tonProvider = new MockChainProvider(ChainId.TON, [TON_BALANCE]);
    const container = createTestContainer([solProvider, tonProvider]);
    const service = container.get<PortfolioService>(TYPES.PortfolioService);

    const portfolio = await service.getPortfolio('test-address');
    expect(Object.keys(portfolio.chains)).toHaveLength(2);
    expect(portfolio.chains[ChainId.SOLANA].balances[0].uiAmount).toBe(2.0);
    expect(portfolio.chains[ChainId.TON].balances[0].uiAmount).toBe(5.0);
  });

  it('handles single chain failure gracefully', async () => {
    const solProvider = new MockChainProvider(ChainId.SOLANA, [SOL_BALANCE]);
    const failProvider = new MockChainProvider(ChainId.TON, []);
    failProvider.getBalance = async () => { throw new Error('RPC down'); };

    const container = createTestContainer([solProvider, failProvider]);
    const service = container.get<PortfolioService>(TYPES.PortfolioService);

    const portfolio = await service.getPortfolio('test-address');
    expect(Object.keys(portfolio.chains)).toHaveLength(1);
    expect(portfolio.chains[ChainId.SOLANA]).toBeDefined();
  });

  it('returns empty portfolio for no valid providers', async () => {
    const container = createTestContainer([]);
    // Rebind with no providers
    container.unbindAll();
    container.bind<ChainPulseConfig>(TYPES.Config).toConstantValue({ chains: [] });
    container.bind<IChainProvider>(TYPES.ChainProvider).toConstantValue(
      new MockChainProvider(ChainId.SOLANA, []),
    );
    container.bind<PriceService>(TYPES.PriceService).to(PriceService);
    container.bind<PortfolioService>(TYPES.PortfolioService).to(PortfolioService);

    const service = container.get<PortfolioService>(TYPES.PortfolioService);
    const portfolio = await service.getPortfolio('test');
    expect(portfolio.totalUsdValue).toBe(0);
  });
});
