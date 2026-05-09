import { ChainId } from '../constants';

export type TxType = 'transfer' | 'swap' | 'mint' | 'burn' | 'stake' | 'unknown';

export interface Transaction {
  hash: string;
  chainId: ChainId;
  type: TxType;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  timestamp: number;
  fee: string;
  status: 'success' | 'failed' | 'pending';
}
