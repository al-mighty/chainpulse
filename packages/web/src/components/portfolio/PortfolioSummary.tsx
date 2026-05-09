import React from 'react';
import { ChainPieChart } from './ChainPieChart';

interface Props {
  portfolio: any;
  loading: boolean;
}

export function PortfolioSummary({ portfolio, loading }: Props) {
  if (loading) return <div style={card}>Loading...</div>;
  if (!portfolio) return null;

  const chains = Object.values(portfolio.chains || {}) as any[];

  return (
    <div>
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-dim)', letterSpacing: 2, marginBottom: 8 }}>TOTAL VALUE</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
            ${portfolio.totalUsdValue?.toFixed(2) || '0.00'}
          </div>
        </div>
        {chains.length > 0 && <ChainPieChart chains={chains} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
        {chains.map((chain: any) => (
          <div key={chain.chainId} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: chain.chainId === 'solana' ? 'var(--chain-sol)' : 'var(--chain-ton)',
              }}>
                {chain.chainId === 'solana' ? '◆ Solana' : '◆ TON'}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-dim)' }}>
                ${chain.totalUsdValue?.toFixed(2)}
              </span>
            </div>
            {chain.balances?.map((b: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{b.token.symbol}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-dim)' }}>
                  {b.uiAmount?.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'var(--bg-2)', borderRadius: 'var(--radius)', padding: 24,
  border: '1px solid var(--line)',
};
