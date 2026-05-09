import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface NFT {
  mint: string;
  name: string;
  imageUrl?: string;
  collection?: string;
  chainId: string;
}

interface Props {
  address: string;
}

const CHAIN_COLORS: Record<string, string> = {
  solana: '#9945FF',
  ton: '#0098EA',
};

export function NFTGallery({ address }: Props) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chainpulse/portfolio/${address}/nfts`)
      .then(r => r.json())
      .then(setNfts)
      .catch(() => setNfts([]))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <div style={{ color: 'var(--ink-dim)', padding: 24 }}>Loading NFTs...</div>;
  if (nfts.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink-dim)', marginBottom: 12, letterSpacing: 2 }}>
        NFTs ({nfts.length})
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {nfts.map((nft, i) => (
          <div key={i} style={{
            background: 'var(--bg-2)', borderRadius: 'var(--radius)',
            border: '1px solid var(--line)', overflow: 'hidden',
          }}>
            <div style={{
              height: 140, background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32, opacity: 0.3 }}>◆</span>
              )}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: 'var(--ink)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {nft.name}
              </div>
              <div style={{
                fontSize: 10, color: CHAIN_COLORS[nft.chainId] || 'var(--ink-dim)',
                marginTop: 2,
              }}>
                {nft.chainId.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
