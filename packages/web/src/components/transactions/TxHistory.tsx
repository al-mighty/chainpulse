import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Tx {
  hash: string;
  chainId: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  timestamp: number;
  fee: string;
  status: string;
}

interface Props {
  address: string;
}

const CHAIN_COLORS: Record<string, string> = {
  solana: '#9945FF',
  ton: '#0098EA',
};

const TYPE_ICONS: Record<string, string> = {
  transfer: '↗',
  swap: '⇄',
  mint: '✦',
  stake: '⚡',
  unknown: '•',
};

function groupByDate(txs: Tx[]): Record<string, Tx[]> {
  const groups: Record<string, Tx[]> = {};
  for (const tx of txs) {
    const date = new Date(tx.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    (groups[date] ||= []).push(tx);
  }
  return groups;
}

function TxRow({ tx, isLast }: { tx: Tx; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const chainColor = CHAIN_COLORS[tx.chainId] || 'var(--ink-dim)';
  const icon = TYPE_ICONS[tx.type] || '•';

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Tree connector */}
        <div style={{ width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: 1, height: 8, background: 'var(--line-2)' }} />
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: chainColor, border: `2px solid ${chainColor}`,
            boxShadow: `0 0 6px ${chainColor}40`,
          }} />
          {!isLast && <div style={{ width: 1, height: 8, background: 'var(--line-2)' }} />}
        </div>

        {/* Icon */}
        <span style={{ fontSize: 14, color: chainColor, width: 20, textAlign: 'center', flexShrink: 0 }}>
          {icon}
        </span>

        {/* Type + chain */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' }}>
              {tx.type}
            </span>
            <span style={{
              fontSize: 9, color: chainColor, background: `${chainColor}15`,
              padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--mono)',
              letterSpacing: 1, textTransform: 'uppercase',
            }}>
              {tx.chainId}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 }}>
            {tx.hash.slice(0, 12)}...{tx.hash.slice(-6)}
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            {tx.amount} {tx.symbol}
          </div>
          <div style={{
            fontSize: 11, marginTop: 2,
            color: tx.status === 'success' ? 'var(--success)' : tx.status === 'failed' ? 'var(--danger)' : 'var(--ink-dim)',
          }}>
            {tx.status === 'success' ? '✓' : tx.status === 'failed' ? '✗' : '⏳'} {tx.status}
          </div>
        </div>

        {/* Expand arrow */}
        <span style={{
          fontSize: 10, color: 'var(--ink-dim)', transition: 'transform 0.2s',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0,
        }}>
          ▶
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: '0 14px 12px 46px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px',
          fontFamily: 'var(--mono)', fontSize: 11,
        }}>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>From: </span>
            <span style={{ color: 'var(--ink)' }}>{tx.from ? `${tx.from.slice(0, 10)}...${tx.from.slice(-6)}` : '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>To: </span>
            <span style={{ color: 'var(--ink)' }}>{tx.to ? `${tx.to.slice(0, 10)}...${tx.to.slice(-6)}` : '—'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>Fee: </span>
            <span style={{ color: 'var(--ink)' }}>{tx.fee}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ink-dim)' }}>Time: </span>
            <span style={{ color: 'var(--ink)' }}>
              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          height: 44, borderRadius: 6,
          background: 'linear-gradient(90deg, var(--bg-2) 25%, rgba(255,255,255,0.04) 50%, var(--bg-2) 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}

export function TxHistory({ address }: Props) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTransactions(address)
      .then(setTxs)
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [address]);

  const grouped = groupByDate(txs);
  const dates = Object.keys(grouped);

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink-dim)', marginBottom: 12, letterSpacing: 2 }}>
        TRANSACTIONS {txs.length > 0 && `(${txs.length})`}
      </h3>

      {loading ? (
        <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
          <SkeletonRows />
        </div>
      ) : txs.length === 0 ? (
        <div style={{
          background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)',
          padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>📭</div>
          <div style={{ color: 'var(--ink-dim)', fontSize: 13 }}>No transactions found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dates.map(date => (
            <div key={date}>
              <div style={{
                fontSize: 11, color: 'var(--ink-dim)', letterSpacing: 1,
                marginBottom: 6, paddingLeft: 4,
              }}>
                {date}
              </div>
              <div style={{
                background: 'var(--bg-2)', borderRadius: 'var(--radius)',
                border: '1px solid var(--line)', overflow: 'hidden',
              }}>
                {grouped[date].map((tx, i) => (
                  <TxRow key={tx.hash + i} tx={tx} isLast={i === grouped[date].length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
