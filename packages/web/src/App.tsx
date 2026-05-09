import React, { useState } from 'react';
import { WalletConnect } from './components/wallet/WalletConnect';
import { PortfolioSummary } from './components/portfolio/PortfolioSummary';
import { TxHistory } from './components/transactions/TxHistory';
import { NFTGallery } from './components/portfolio/NFTGallery';
import { usePortfolio } from './hooks/usePortfolio';

export function App() {
  const [address, setAddress] = useState<string | null>(null);
  const { portfolio, loading, error } = usePortfolio(address);

  return (
    <div style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
      {!address ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <WalletConnect onConnect={setAddress} />
        </div>
      ) : (
        <>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 300 }}>
                Chain<span style={{ color: 'var(--accent)', fontWeight: 700 }}>Pulse</span>
              </h1>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-dim)', marginTop: 4 }}>
                {address.slice(0, 8)}...{address.slice(-6)}
              </div>
            </div>
            <button
              onClick={() => setAddress(null)}
              style={{
                background: 'transparent', border: '1px solid var(--line-2)',
                color: 'var(--ink-dim)', padding: '8px 16px', borderRadius: 'var(--radius)',
                cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
              }}
            >
              Disconnect
            </button>
          </header>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 'var(--radius)', color: 'var(--danger)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <PortfolioSummary portfolio={portfolio} loading={loading} />
          <NFTGallery address={address} />
          <TxHistory address={address} />

          <footer style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <a href="https://cheslav.space" style={{ color: 'var(--ink-dim)', fontSize: 12 }}>
              Built by Vyacheslav Kovalev
            </a>
            {' · '}
            <a href="https://github.com/al-mighty/chainpulse" style={{ fontSize: 12 }}>
              Source code
            </a>
          </footer>
        </>
      )}
    </div>
  );
}
