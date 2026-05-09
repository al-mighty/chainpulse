import React, { useState, useEffect } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

interface Props {
  onConnect: (address: string) => void;
}

export function WalletConnect({ onConnect }: Props) {
  const [input, setInput] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  useEffect(() => {
    if (tonAddress) onConnect(tonAddress);
  }, [tonAddress]);

  const handlePhantom = async () => {
    try {
      const phantom = (window as any).phantom?.solana;
      if (!phantom) { alert('Install Phantom wallet'); return; }
      const { publicKey } = await phantom.connect();
      onConnect(publicKey.toString());
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleManual = () => {
    if (input.trim()) onConnect(input.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <h2 style={{ fontSize: 28, fontWeight: 300, color: 'var(--ink)' }}>
        Chain<span style={{ color: 'var(--accent)', fontWeight: 700 }}>Pulse</span>
      </h2>
      <p style={{ color: 'var(--ink-dim)', fontSize: 14 }}>Multi-chain portfolio tracker</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={handlePhantom} style={btnStyle('#9945FF')}>
          Phantom (SOL)
        </button>
        <button onClick={() => tonConnectUI.openModal()} style={btnStyle('#0098EA')}>
          TON Connect
        </button>
      </div>

      <div style={{ margin: '24px 0', color: 'var(--ink-dim)', fontSize: 12 }}>or enter address manually</div>

      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 500 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Solana or TON address"
          style={inputStyle}
        />
        <button onClick={handleManual} style={btnStyle('var(--accent)')}>
          Track
        </button>
      </div>
    </div>
  );
}

const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg, color: '#fff', border: 'none', borderRadius: 'var(--radius)',
  padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12,
  fontWeight: 600, letterSpacing: 1, transition: 'opacity 0.2s',
});

const inputStyle: React.CSSProperties = {
  flex: 1, background: 'var(--bg-2)', color: 'var(--ink)', border: '1px solid var(--line-2)',
  borderRadius: 'var(--radius)', padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 13,
  outline: 'none',
};
