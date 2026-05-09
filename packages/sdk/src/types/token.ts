import { ChainId } from '../constants';

export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoUrl?: string;
}

export interface Balance {
  token: TokenInfo;
  amount: string;
  uiAmount: number;
  usdValue?: number;
}

export interface Portfolio {
  address: string;
  totalUsdValue: number;
  chains: Record<string, ChainPortfolio>;
  updatedAt: number;
}

export interface ChainPortfolio {
  chainId: ChainId;
  balances: Balance[];
  totalUsdValue: number;
}

export interface NFTAsset {
  mint: string;
  name: string;
  imageUrl?: string;
  collection?: string;
  chainId: ChainId;
}
