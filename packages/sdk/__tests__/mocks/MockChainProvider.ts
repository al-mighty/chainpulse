import 'reflect-metadata';
import { injectable } from 'inversify';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChainId } from '../../src/constants';
import type { IChainProvider, Balance, Transaction, NFTAsset } from '../../src/types';

@injectable()
export class MockChainProvider implements IChainProvider {
  readonly chainId: ChainId;
  readonly name: string;
  private balanceSubject: BehaviorSubject<Balance[]>;

  constructor(chainId: ChainId = ChainId.SOLANA, balances: Balance[] = []) {
    this.chainId = chainId;
    this.name = `Mock ${chainId}`;
    this.balanceSubject = new BehaviorSubject(balances);
  }

  isValidAddress(_address: string): boolean { return true; }

  async getBalance(_address: string): Promise<Balance[]> {
    return this.balanceSubject.value;
  }

  async getTransactions(_address: string, _limit?: number): Promise<Transaction[]> {
    return [{
      hash: 'mock-tx-hash',
      chainId: this.chainId,
      type: 'transfer',
      from: 'sender',
      to: 'receiver',
      amount: '1000000000',
      symbol: 'SOL',
      timestamp: Date.now(),
      fee: '5000',
      status: 'success',
    }];
  }

  async getNFTs(_address: string): Promise<NFTAsset[]> { return []; }

  subscribeToBalanceChanges(_address: string): Observable<Balance[]> {
    return this.balanceSubject.asObservable();
  }

  emitBalance(balances: Balance[]) {
    this.balanceSubject.next(balances);
  }
}
