import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Props {
  address: string;
}

export function TxHistory({ address }: Props) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransactions(address)
      .then(setTxs)
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <div style={{ color: 'var(--ink-dim)', padding: 24 }}>Loading transactions...</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink-dim)', marginBottom: 12, letterSpacing: 2 }}>
        TRANSACTIONS
      </h3>
      <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflow: 'hidden' }}>
        {txs.length === 0 && (
          <div style={{ padding: 24, color: 'var(--ink-dim)', textAlign: 'center' }}>No transactions found</div>
        )}
        {txs.slice(0, 20).map((tx, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px',
            padding: '12px 16px', borderBottom: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 12,
          }}>
            <span style={{ color: tx.chainId === 'solana' ? 'var(--chain-sol)' : 'var(--chain-ton)' }}>
              {tx.chainId}
            </span>
            <span style={{ color: 'var(--ink-dim)' }}>{tx.hash?.slice(0, 16)}...</span>
            <span style={{ textAlign: 'right' }}>{tx.amount} {tx.symbol}</span>
            <span style={{ textAlign: 'right', color: tx.status === 'success' ? 'var(--success)' : 'var(--danger)' }}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
