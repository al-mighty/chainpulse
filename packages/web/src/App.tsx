import React, { useState, useCallback, lazy, Suspense } from 'react';
import { WalletConnect } from './components/wallet/WalletConnect';
import { PortfolioSummary } from './components/portfolio/PortfolioSummary';
import { TxHistory } from './components/transactions/TxHistory';
import { NFTGallery } from './components/portfolio/NFTGallery';

const TxFlowGraph = lazy(() => import('./components/transactions/TxFlowGraph').then(m => ({ default: m.TxFlowGraph })));
import { usePortfolio } from './hooks/usePortfolio';
import { api } from './lib/api';

function generateDemoTxs(address: string) {
  const now = Date.now();
  const addrs = [
    '3Kz9X4...demo1', '7Ppgch...demo2', 'DRpbC...demo3',
    'EQDtFp...demo4', 'HN7cA...demo5',
  ];
  const types = ['transfer', 'swap', 'transfer', 'stake', 'transfer'];
  const chains = ['solana', 'solana', 'ton', 'solana', 'ton'];
  const symbols = ['SOL', 'USDC', 'TON', 'SOL', 'TON'];
  const amounts = ['2.5', '150', '10', '5.0', '3.2'];

  return Array.from({ length: 8 }, (_, i) => ({
    hash: `demo${Math.random().toString(36).slice(2, 18)}${i}`,
    chainId: chains[i % chains.length],
    type: types[i % types.length],
    from: i % 2 === 0 ? address : addrs[i % addrs.length],
    to: i % 2 === 0 ? addrs[i % addrs.length] : address,
    amount: amounts[i % amounts.length],
    symbol: symbols[i % symbols.length],
    timestamp: now - i * 3600000 * (2 + Math.random() * 10),
    fee: (Math.random() * 0.01).toFixed(6),
    status: i === 3 ? 'failed' : 'success',
  }));
}

function getAddressFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('address') || null;
}

export function App() {
  const [address, setAddressRaw] = useState<string | null>(getAddressFromUrl);
  const [refreshKey, setRefreshKey] = useState(0);
  const [txs, setTxs] = useState<any[]>([]);

  const setAddress = useCallback((addr: string | null) => {
    setAddressRaw(addr);
    const url = new URL(window.location.href);
    if (addr) url.searchParams.set('address', addr);
    else url.searchParams.delete('address');
    history.replaceState(null, '', url.toString());
  }, []);
  const { portfolio, loading, error } = usePortfolio(address, refreshKey);
  const handleRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const [demoMode, setDemoMode] = useState(false);

  // Load txs for flow graph
  React.useEffect(() => {
    if (!address) { setTxs([]); return; }
    api.getTransactions(address).then(data => {
      if (data.length > 0) { setTxs(data); setDemoMode(false); }
      else { setTxs(generateDemoTxs(address)); setDemoMode(true); }
    }).catch(() => { setTxs(generateDemoTxs(address)); setDemoMode(true); });
  }, [address, refreshKey]);

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
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  background: 'transparent', border: '1px solid var(--line-2)',
                  color: loading ? 'var(--line-2)' : 'var(--accent)', padding: '8px 16px', borderRadius: 'var(--radius)',
                  cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11,
                }}
              >
                {loading ? '...' : '↻ Refresh'}
              </button>
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
            </div>
          </header>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 'var(--radius)', color: 'var(--danger)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <PortfolioSummary portfolio={portfolio} loading={loading} />
          {demoMode && (
            <div style={{
              background: 'rgba(212,255,58,0.08)', border: '1px solid rgba(212,255,58,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 16,
              fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)',
            }}>
              ⚡ Demo mode — showing sample transactions (public RPC rate limited)
            </div>
          )}
          <Suspense fallback={<div style={{ height: 500, background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-dim)', marginTop: 24 }}>Loading graph...</div>}>
            <TxFlowGraph txs={txs} address={address} />
          </Suspense>
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
