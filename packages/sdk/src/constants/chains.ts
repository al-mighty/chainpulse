export enum ChainId {
  SOLANA = 'solana',
  TON = 'ton',
}

export const CHAIN_META: Record<ChainId, { name: string; symbol: string; decimals: number; coingeckoId: string }> = {
  [ChainId.SOLANA]: { name: 'Solana', symbol: 'SOL', decimals: 9, coingeckoId: 'solana' },
  [ChainId.TON]: { name: 'TON', symbol: 'TON', decimals: 9, coingeckoId: 'the-open-network' },
};
