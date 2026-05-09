import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ParsedTransactionWithMeta } from '@solana/web3.js';
import { Observable, timer, switchMap, shareReplay, retry } from 'rxjs';
import { TYPES, ChainId, CHAIN_META } from '../../constants';
import type { IChainProvider, ChainPulseConfig, Balance, Transaction, NFTAsset } from '../../types';

const KNOWN_TOKENS: Record<string, { symbol: string; name: string; coingeckoId?: string }> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether', coingeckoId: 'tether' },
  'So11111111111111111111111111111111111111112': { symbol: 'wSOL', name: 'Wrapped SOL', coingeckoId: 'solana' },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', name: 'Jupiter', coingeckoId: 'jupiter-exchange-solana' },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk', coingeckoId: 'bonk' },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade SOL', coingeckoId: 'msol' },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'ETH', name: 'Ethereum (Wormhole)', coingeckoId: 'ethereum' },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': { symbol: 'RNDR', name: 'Render', coingeckoId: 'render-token' },
};

@injectable()
export class SolanaProvider implements IChainProvider {
  readonly chainId = ChainId.SOLANA;
  readonly name = 'Solana';
  private connection: Connection;

  constructor(@inject(TYPES.Config) config: ChainPulseConfig) {
    this.connection = new Connection(
      config.solanaRpcUrl || 'https://api.mainnet-beta.solana.com',
      'confirmed',
    );
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getBalance(address: string): Promise<Balance[]> {
    const pubkey = new PublicKey(address);
    const balances: Balance[] = [];

    // Native SOL
    const lamports = await this.connection.getBalance(pubkey);
    const solAmount = lamports / LAMPORTS_PER_SOL;
    balances.push({
      token: {
        symbol: 'SOL',
        name: 'Solana',
        mint: 'native',
        decimals: CHAIN_META[ChainId.SOLANA].decimals,
      },
      amount: lamports.toString(),
      uiAmount: solAmount,
    });

    // SPL tokens
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      for (const { account } of tokenAccounts.value) {
        const info = account.data.parsed?.info;
        if (!info || info.tokenAmount.uiAmount === 0) continue;
        const known = KNOWN_TOKENS[info.mint];
        balances.push({
          token: {
            symbol: known?.symbol || info.mint.slice(0, 6),
            name: known?.name || info.mint,
            mint: info.mint,
            decimals: info.tokenAmount.decimals,
          },
          amount: info.tokenAmount.amount,
          uiAmount: info.tokenAmount.uiAmount,
        });
      }
    } catch {
      // Token accounts may fail, return at least SOL balance
    }

    return balances;
  }

  async getTransactions(address: string, limit = 20): Promise<Transaction[]> {
    const pubkey = new PublicKey(address);
    const sigs = await this.connection.getSignaturesForAddress(pubkey, { limit });

    const txs = await this.connection.getParsedTransactions(
      sigs.map(s => s.signature),
      { maxSupportedTransactionVersion: 0 },
    );

    return sigs.map((sig, i) => {
      const tx = txs[i];
      return {
        hash: sig.signature,
        chainId: ChainId.SOLANA,
        type: this.inferTxType(tx),
        from: address,
        to: '',
        amount: '0',
        symbol: 'SOL',
        timestamp: (sig.blockTime || 0) * 1000,
        fee: tx?.meta?.fee?.toString() || '0',
        status: sig.err ? 'failed' as const : 'success' as const,
      };
    });
  }

  async getNFTs(address: string): Promise<NFTAsset[]> {
    try {
      const pubkey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      return tokenAccounts.value
        .filter(({ account }) => {
          const info = account.data.parsed?.info;
          return info?.tokenAmount?.uiAmount === 1 && info?.tokenAmount?.decimals === 0;
        })
        .map(({ account }) => {
          const mint = account.data.parsed?.info?.mint || '';
          return {
            mint,
            name: `NFT ${mint.slice(0, 8)}`,
            chainId: ChainId.SOLANA,
          };
        });
    } catch {
      return [];
    }
  }

  subscribeToBalanceChanges(address: string): Observable<Balance[]> {
    return timer(0, 30000).pipe(
      switchMap(() => this.getBalance(address)),
      retry({ count: 3, delay: 5000 }),
      shareReplay(1),
    );
  }

  private inferTxType(tx: ParsedTransactionWithMeta | null): Transaction['type'] {
    if (!tx?.meta) return 'unknown';
    const instructions = tx.transaction.message.instructions;
    for (const ix of instructions) {
      if ('program' in ix) {
        if (ix.program === 'system' && 'parsed' in ix && ix.parsed?.type === 'transfer') return 'transfer';
        if (ix.program === 'spl-token') return 'transfer';
      }
    }
    return 'unknown';
  }
}
