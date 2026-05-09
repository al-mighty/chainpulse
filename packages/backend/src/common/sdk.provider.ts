import { Provider } from '@nestjs/common';
import {
  createChainPulseContainer,
  ChainId,
  TYPES,
  PortfolioService,
  PriceService,
  StreamService,
} from '@chainpulse/sdk';
import type { Container } from 'inversify';

export const SDK_CONTAINER = 'SDK_CONTAINER';

export const sdkProviders: Provider[] = [
  {
    provide: SDK_CONTAINER,
    useFactory: () => {
      return createChainPulseContainer({
        chains: [ChainId.SOLANA, ChainId.TON],
        solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        tonRpcUrl: process.env.TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC',
      });
    },
  },
  {
    provide: 'PortfolioService',
    useFactory: (container: Container) => container.get<PortfolioService>(TYPES.PortfolioService),
    inject: [SDK_CONTAINER],
  },
  {
    provide: 'PriceService',
    useFactory: (container: Container) => container.get<PriceService>(TYPES.PriceService),
    inject: [SDK_CONTAINER],
  },
  {
    provide: 'StreamService',
    useFactory: (container: Container) => container.get<StreamService>(TYPES.StreamService),
    inject: [SDK_CONTAINER],
  },
];
