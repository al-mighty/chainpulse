import React, { useEffect, useState } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';

export function App() {
  const address = useTonAddress();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  useEffect(() => {
    if (!address) return;
    fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`)
      .then(r => r.json())
      .then(data => {
        const tons = (parseInt(data.result || '0') / 1e9).toFixed(4);
        setBalance(tons);
      })
      .catch(() => setBalance('Error'));
  }, [address]);

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, fontWeight: 300, marginBottom: 4 }}>
        Chain<span style={{ color: 'var(--button)', fontWeight: 700 }}>Pulse</span>
      </h1>
      <p style={{ color: 'var(--hint)', fontSize: 13, marginBottom: 24 }}>TON Wallet Tracker</p>

      <TonConnectButton />

      {address && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            background: 'var(--section-bg)', borderRadius: 12, padding: 20,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: 'var(--hint)', letterSpacing: 2, marginBottom: 8 }}>BALANCE</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--button)' }}>
              {balance || '...'} TON
            </div>
          </div>
          <div style={{
            background: 'var(--section-bg)', borderRadius: 12, padding: 16,
            fontSize: 12, color: 'var(--hint)', wordBreak: 'break-all',
          }}>
            {address}
          </div>
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <a href="https://cheslav.space" style={{ color: 'var(--hint)', fontSize: 11 }}>
          by Vyacheslav Kovalev
        </a>
      </div>
    </div>
  );
}
