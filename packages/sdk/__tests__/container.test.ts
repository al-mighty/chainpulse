import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES, ChainId } from '../src/constants';
import { PortfolioService } from '../src/services/PortfolioService';
import { PriceService } from '../src/services/PriceService';
import { StreamService } from '../src/services/StreamService';
import { MockChainProvider } from './mocks/MockChainProvider';
import type { IChainProvider, ChainPulseConfig } from '../src/types';

function createTestContainer(chains: ChainId[]): Container {
  const container = new Container();
  const config: ChainPulseConfig = { chains };
  container.bind<ChainPulseConfig>(TYPES.Config).toConstantValue(config);

  for (const chain of chains) {
    container.bind<IChainProvider>(TYPES.ChainProvider).toConstantValue(new MockChainProvider(chain));
  }

  container.bind<PriceService>(TYPES.PriceService).to(PriceService).inSingletonScope();
  container.bind<PortfolioService>(TYPES.PortfolioService).to(PortfolioService).inSingletonScope();
  container.bind<StreamService>(TYPES.StreamService).to(StreamService).inSingletonScope();
  return container;
}

describe('ChainPulse Container', () => {
  it('creates container with single chain', () => {
    const container = createTestContainer([ChainId.SOLANA]);
    const providers = container.getAll<IChainProvider>(TYPES.ChainProvider);
    expect(providers).toHaveLength(1);
    expect(providers[0].chainId).toBe(ChainId.SOLANA);
  });

  it('creates container with both chains', () => {
    const container = createTestContainer([ChainId.SOLANA, ChainId.TON]);
    const providers = container.getAll<IChainProvider>(TYPES.ChainProvider);
    expect(providers).toHaveLength(2);
    expect(providers.map(p => p.chainId)).toContain(ChainId.SOLANA);
    expect(providers.map(p => p.chainId)).toContain(ChainId.TON);
  });

  it('resolves services as singletons', () => {
    const container = createTestContainer([ChainId.SOLANA]);
    const ps1 = container.get<PriceService>(TYPES.PriceService);
    const ps2 = container.get<PriceService>(TYPES.PriceService);
    expect(ps1).toBe(ps2);
  });

  it('resolves PortfolioService', () => {
    const container = createTestContainer([ChainId.SOLANA, ChainId.TON]);
    const service = container.get<PortfolioService>(TYPES.PortfolioService);
    expect(service).toBeDefined();
  });

  it('resolves StreamService', () => {
    const container = createTestContainer([ChainId.SOLANA]);
    const service = container.get<StreamService>(TYPES.StreamService);
    expect(service).toBeDefined();
  });
});
