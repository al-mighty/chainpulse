import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { TonClient, Address, fromNano } from '@ton/ton';
import { Observable, timer, switchMap, shareReplay, retry } from 'rxjs';
import { TYPES, ChainId, CHAIN_META } from '../../constants';
import type { IChainProvider, ChainPulseConfig, Balance, Transaction, NFTAsset } from '../../types';

@injectable()
export class TonProvider implements IChainProvider {
  readonly chainId = ChainId.TON;
  readonly name = 'TON';
  private client: TonClient;

  constructor(@inject(TYPES.Config) config: ChainPulseConfig) {
    this.client = new TonClient({
      endpoint: config.tonRpcUrl || 'https://toncenter.com/api/v2/jsonRPC',
    });
  }

  isValidAddress(address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }

  async getBalance(address: string): Promise<Balance[]> {
    const addr = Address.parse(address);
    const balance = await this.client.getBalance(addr);
    const uiAmount = parseFloat(fromNano(balance));

    return [{
      token: {
        symbol: 'TON',
        name: 'Toncoin',
        mint: 'native',
        decimals: CHAIN_META[ChainId.TON].decimals,
      },
      amount: balance.toString(),
      uiAmount,
    }];
  }

  async getTransactions(address: string, limit = 20): Promise<Transaction[]> {
    const addr = Address.parse(address);
    const txs = await this.client.getTransactions(addr, { limit });

    return txs.map(tx => ({
      hash: tx.hash().toString('hex'),
      chainId: ChainId.TON,
      type: 'transfer' as const,
      from: address,
      to: tx.inMessage?.info?.type === 'internal' ? tx.inMessage.info.dest?.toString() || '' : '',
      amount: tx.inMessage?.info?.type === 'internal' ? fromNano(tx.inMessage.info.value.coins) : '0',
      symbol: 'TON',
      timestamp: tx.now * 1000,
      fee: fromNano(tx.totalFees.coins),
      status: 'success' as const,
    }));
  }

  async getNFTs(_address: string): Promise<NFTAsset[]> {
    // Would use TON API v2 for NFTs
    return [];
  }

  subscribeToBalanceChanges(address: string): Observable<Balance[]> {
    return timer(0, 15000).pipe(
      switchMap(() => this.getBalance(address)),
      retry({ count: 3, delay: 5000 }),
      shareReplay(1),
    );
  }
}
