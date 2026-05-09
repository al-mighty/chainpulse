import { Observable } from 'rxjs';
import { ChainId } from '../constants';
import { Balance, NFTAsset } from './token';
import { Transaction } from './transaction';

export interface ChainPulseConfig {
  chains: ChainId[];
  solanaRpcUrl?: string;
  tonRpcUrl?: string;
  coingeckoApiKey?: string;
}

export interface IChainProvider {
  readonly chainId: ChainId;
  readonly name: string;

  getBalance(address: string): Promise<Balance[]>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
  getNFTs(address: string): Promise<NFTAsset[]>;
  isValidAddress(address: string): boolean;
  subscribeToBalanceChanges(address: string): Observable<Balance[]>;
}

export interface WalletConnection {
  address: string;
  chainId: ChainId;
  publicKey: string;
}

export interface IWalletAdapter {
  readonly chainId: ChainId;
  readonly name: string;

  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  readonly connection$: Observable<WalletConnection | null>;
}
