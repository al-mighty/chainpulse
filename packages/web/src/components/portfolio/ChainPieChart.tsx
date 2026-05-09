import React from 'react';

interface ChainData {
  chainId: string;
  totalUsdValue: number;
}

interface Props {
  chains: ChainData[];
}

const COLORS: Record<string, string> = {
  solana: '#9945FF',
  ton: '#0098EA',
};

export function ChainPieChart({ chains }: Props) {
  const total = chains.reduce((s, c) => s + c.totalUsdValue, 0);
  if (total === 0) return null;

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const innerR = 40;

  let cumulative = 0;
  const slices = chains.map(chain => {
    const pct = chain.totalUsdValue / total;
    const start = cumulative;
    cumulative += pct;
    return { ...chain, pct, start, end: cumulative };
  });

  function arcPath(startPct: number, endPct: number, outerR: number, inner: number) {
    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPct * 2 * Math.PI - Math.PI / 2;
    const largeArc = endPct - startPct > 0.5 ? 1 : 0;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + inner * Math.cos(endAngle);
    const y3 = cy + inner * Math.sin(endAngle);
    const x4 = cx + inner * Math.cos(startAngle);
    const y4 = cy + inner * Math.sin(startAngle);

    return `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${largeArc} 0 ${x4},${y4} Z`;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, i) => (
          <path
            key={i}
            d={arcPath(slice.start, slice.end, r, innerR)}
            fill={COLORS[slice.chainId] || '#666'}
            opacity={0.9}
          >
            <title>{slice.chainId}: ${slice.totalUsdValue.toFixed(2)} ({(slice.pct * 100).toFixed(1)}%)</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--ink)" fontSize={16} fontWeight={700} fontFamily="var(--mono)">
          ${total.toFixed(0)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--ink-dim)" fontSize={9} letterSpacing={2}>
          TOTAL
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[slice.chainId] || '#666' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)' }}>
              {slice.chainId.toUpperCase()}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-dim)' }}>
              {(slice.pct * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
