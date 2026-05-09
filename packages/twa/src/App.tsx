import React, { useEffect, useState, useCallback } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

interface TxItem {
  hash: string;
  amount: string;
  from: string;
  to: string;
  time: number;
}

function haptic(type: 'light' | 'medium' | 'success' | 'error') {
  try {
    if (type === 'success') WebApp.HapticFeedback.notificationOccurred('success');
    else if (type === 'error') WebApp.HapticFeedback.notificationOccurred('error');
    else WebApp.HapticFeedback.impactOccurred(type);
  } catch {}
}

export function App() {
  const address = useTonAddress();
  const [balance, setBalance] = useState<string | null>(null);
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#0a0e1a');
    WebApp.setBackgroundColor('#0a0e1a');
  }, []);

  const fetchData = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      // Balance
      const balRes = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${addr}`);
      const balData = await balRes.json();
      const tons = (parseInt(balData.result || '0') / 1e9).toFixed(4);
      setBalance(tons);

      // Transactions
      const txRes = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${addr}&limit=10`);
      const txData = await txRes.json();
      const items: TxItem[] = (txData.result || []).map((tx: any) => ({
        hash: tx.transaction_id?.hash || '',
        amount: (parseInt(tx.in_msg?.value || '0') / 1e9).toFixed(4),
        from: tx.in_msg?.source || '',
        to: tx.in_msg?.destination || '',
        time: tx.utime * 1000,
      }));
      setTxs(items);
      haptic('success');
    } catch {
      setError('Failed to load data');
      haptic('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) fetchData(address);
  }, [address, fetchData]);

  const handleRefresh = () => {
    if (address) {
      haptic('light');
      fetchData(address);
    }
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 300, margin: 0 }}>
            Chain<span style={{ color: 'var(--button)', fontWeight: 700 }}>Pulse</span>
          </h1>
          <p style={{ color: 'var(--hint)', fontSize: 12, margin: '2px 0 0' }}>TON Wallet Tracker</p>
        </div>
        <TonConnectButton />
      </div>

      {!address && (
        <div style={{
          background: 'var(--section-bg)', borderRadius: 16, padding: 32,
          textAlign: 'center', marginTop: 40,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💎</div>
          <div style={{ color: 'var(--text)', fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            Connect your wallet
          </div>
          <div style={{ color: 'var(--hint)', fontSize: 13 }}>
            Track TON balance and transaction history
          </div>
        </div>
      )}

      {address && (
        <>
          {/* Balance card */}
          <div style={{
            background: 'var(--section-bg)', borderRadius: 16, padding: 20,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--hint)', letterSpacing: 2 }}>BALANCE</div>
              <button onClick={handleRefresh} style={{
                background: 'none', border: 'none', color: 'var(--hint)',
                fontSize: 18, cursor: 'pointer', padding: 4,
              }}>
                {loading ? '⏳' : '🔄'}
              </button>
            </div>
            {loading && !balance ? (
              <div style={skeleton} />
            ) : (
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--button)', marginTop: 8 }}>
                {balance || '0'} <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--hint)' }}>TON</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div style={{
            background: 'var(--section-bg)', borderRadius: 12, padding: 12,
            fontSize: 11, color: 'var(--hint)', wordBreak: 'break-all',
            marginBottom: 16, fontFamily: 'monospace',
          }}>
            {address}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12,
              color: '#ef4444', fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Transactions */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--hint)', letterSpacing: 2, marginBottom: 8 }}>
              RECENT TRANSACTIONS
            </div>
            {loading && txs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ ...skeleton, height: 48 }} />
                <div style={{ ...skeleton, height: 48 }} />
                <div style={{ ...skeleton, height: 48 }} />
              </div>
            ) : txs.length === 0 ? (
              <div style={{
                background: 'var(--section-bg)', borderRadius: 12, padding: 20,
                textAlign: 'center', color: 'var(--hint)', fontSize: 13,
              }}>
                No transactions yet
              </div>
            ) : (
              <div style={{ background: 'var(--section-bg)', borderRadius: 12, overflow: 'hidden' }}>
                {txs.map((tx, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderBottom: i < txs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                        {parseFloat(tx.amount) > 0 ? '+' : ''}{tx.amount} TON
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--hint)', marginTop: 2 }}>
                        {new Date(tx.time).toLocaleDateString()} {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--hint)', fontFamily: 'monospace' }}>
                      {tx.hash.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <a href="https://cheslav.space/chainpulse/" target="_blank" style={linkBtn}>
              Full Dashboard ↗
            </a>
            <a href="https://cheslav.space" target="_blank" style={linkBtn}>
              Portfolio ↗
            </a>
          </div>
        </>
      )}

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <a href="https://cheslav.space" style={{ color: 'var(--hint)', fontSize: 11, textDecoration: 'none' }}>
          by Vyacheslav Kovalev
        </a>
      </div>
    </div>
  );
}

const skeleton: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--section-bg) 25%, rgba(255,255,255,0.05) 50%, var(--section-bg) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 12,
  height: 60,
};

const linkBtn: React.CSSProperties = {
  flex: 1, textAlign: 'center', padding: '10px 12px',
  background: 'var(--section-bg)', borderRadius: 10,
  color: 'var(--button)', fontSize: 12, fontWeight: 500,
  textDecoration: 'none',
};
