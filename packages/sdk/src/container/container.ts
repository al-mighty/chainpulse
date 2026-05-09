import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES, ChainId } from '../constants';
import type { ChainPulseConfig, IChainProvider } from '../types';
import { SolanaProvider } from '../providers/solana/SolanaProvider';
import { TonProvider } from '../providers/ton/TonProvider';
import { PortfolioService } from '../services/PortfolioService';
import { PriceService } from '../services/PriceService';
import { StreamService } from '../services/StreamService';

export function createChainPulseContainer(config: ChainPulseConfig): Container {
  const container = new Container();

  container.bind<ChainPulseConfig>(TYPES.Config).toConstantValue(config);

  if (config.chains.includes(ChainId.SOLANA)) {
    container.bind<IChainProvider>(TYPES.ChainProvider).to(SolanaProvider);
  }

  if (config.chains.includes(ChainId.TON)) {
    container.bind<IChainProvider>(TYPES.ChainProvider).to(TonProvider);
  }

  container.bind<PriceService>(TYPES.PriceService).to(PriceService).inSingletonScope();
  container.bind<PortfolioService>(TYPES.PortfolioService).to(PortfolioService).inSingletonScope();
  container.bind<StreamService>(TYPES.StreamService).to(StreamService).inSingletonScope();

  return container;
}
