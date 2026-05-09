import 'reflect-metadata';
import { Container } from 'inversify';
import { firstValueFrom, take, toArray } from 'rxjs';
import { TYPES, ChainId } from '../../src/constants';
import { StreamService } from '../../src/services/StreamService';
import { PriceService } from '../../src/services/PriceService';
import { MockChainProvider } from '../mocks/MockChainProvider';
import type { IChainProvider, ChainPulseConfig, Balance } from '../../src/types';

function createTestContainer(providers: MockChainProvider[]): Container {
  const container = new Container();
  container.bind<ChainPulseConfig>(TYPES.Config).toConstantValue({ chains: [ChainId.SOLANA] });
  for (const p of providers) {
    container.bind<IChainProvider>(TYPES.ChainProvider).toConstantValue(p);
  }
  container.bind<PriceService>(TYPES.PriceService).to(PriceService).inSingletonScope();
  container.bind<StreamService>(TYPES.StreamService).to(StreamService).inSingletonScope();
  return container;
}

const BALANCE: Balance = {
  token: { symbol: 'SOL', name: 'Solana', mint: 'native', decimals: 9 },
  amount: '1000000000',
  uiAmount: 1.0,
};

describe('StreamService', () => {
  it('emits portfolio on subscription', async () => {
    const provider = new MockChainProvider(ChainId.SOLANA, [BALANCE]);
    const container = createTestContainer([provider]);
    const service = container.get<StreamService>(TYPES.StreamService);

    const portfolio = await firstValueFrom(service.portfolioStream('test-addr'));
    expect(portfolio.address).toBe('test-addr');
    expect(portfolio.chains[ChainId.SOLANA]).toBeDefined();
    expect(portfolio.chains[ChainId.SOLANA].balances[0].uiAmount).toBe(1.0);
  });

  it('accumulates updates from multiple emissions', async () => {
    const provider = new MockChainProvider(ChainId.SOLANA, [BALANCE]);
    const container = createTestContainer([provider]);
    const service = container.get<StreamService>(TYPES.StreamService);

    const stream$ = service.portfolioStream('test-addr').pipe(take(2), toArray());
    const promise = firstValueFrom(stream$);

    // Emit updated balance
    setTimeout(() => {
      provider.emitBalance([{ ...BALANCE, uiAmount: 5.0 }]);
    }, 50);

    const results = await promise;
    expect(results).toHaveLength(2);
    expect(results[0].chains[ChainId.SOLANA].balances[0].uiAmount).toBe(1.0);
    expect(results[1].chains[ChainId.SOLANA].balances[0].uiAmount).toBe(5.0);
  });
});
