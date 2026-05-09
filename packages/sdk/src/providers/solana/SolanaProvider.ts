import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ParsedTransactionWithMeta } from '@solana/web3.js';
import { Observable, timer, switchMap, shareReplay, retry } from 'rxjs';
import { TYPES, ChainId, CHAIN_META } from '../../constants';
import type { IChainProvider, ChainPulseConfig, Balance, Transaction, NFTAsset } from '../../types';

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
        balances.push({
          token: {
            symbol: info.mint.slice(0, 6),
            name: info.mint,
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

  async getNFTs(_address: string): Promise<NFTAsset[]> {
    // Simplified — would use Metaplex in production
    return [];
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
