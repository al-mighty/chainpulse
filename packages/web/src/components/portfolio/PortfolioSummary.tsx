import React from 'react';
import { ChainPieChart } from './ChainPieChart';

interface Props {
  portfolio: any;
  loading: boolean;
}

function Skeleton({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  return <div style={{ ...shimmer, width, height, borderRadius: 6 }} />;
}

export function PortfolioSummary({ portfolio, loading }: Props) {
  if (loading) return (
    <div>
      <div style={card}>
        <Skeleton width={120} height={14} />
        <div style={{ marginTop: 12 }}><Skeleton width={200} height={42} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={card}><Skeleton height={80} /></div>
        <div style={card}><Skeleton height={80} /></div>
      </div>
    </div>
  );
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

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--bg-2) 25%, rgba(255,255,255,0.04) 50%, var(--bg-2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};
