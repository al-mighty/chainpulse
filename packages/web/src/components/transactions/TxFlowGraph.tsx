import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  txs: Tx[];
  address: string;
}

const CHAIN_COLORS: Record<string, string> = {
  solana: '#9945FF',
  ton: '#0098EA',
};

function shorten(addr: string) {
  if (!addr || addr.length < 12) return addr || '???';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Custom node components
function WalletNode({ data }: { data: any }) {
  return (
    <div style={{
      background: data.isOwner ? '#131829' : '#1a2035',
      border: `2px solid ${data.isOwner ? 'var(--accent)' : 'var(--line-2)'}`,
      borderRadius: 12, padding: '12px 16px', minWidth: 140,
      boxShadow: data.isOwner ? '0 0 20px rgba(212,255,58,0.15)' : 'none',
    }}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <div style={{ fontSize: 9, color: 'var(--ink-dim)', letterSpacing: 2, marginBottom: 4 }}>
        {data.isOwner ? 'YOUR WALLET' : 'ADDRESS'}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>
        {shorten(data.address)}
      </div>
      {data.totalAmount && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
          {data.totalAmount}
        </div>
      )}
    </div>
  );
}

function TxNode({ data }: { data: any }) {
  const chainColor = CHAIN_COLORS[data.chainId] || '#666';
  return (
    <div style={{
      background: '#131829', border: `1px solid ${chainColor}40`,
      borderRadius: 8, padding: '8px 12px', minWidth: 120,
    }}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: chainColor }} />
        <span style={{
          fontSize: 9, color: chainColor, letterSpacing: 1,
          textTransform: 'uppercase', fontFamily: 'var(--mono)',
        }}>
          {data.chainId}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>
        {data.amount} {data.symbol}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-dim)', marginTop: 2 }}>
        {data.hash.slice(0, 10)}...
      </div>
      <div style={{
        fontSize: 9, marginTop: 3,
        color: data.status === 'success' ? 'var(--success)' : 'var(--danger)',
      }}>
        {data.status === 'success' ? '✓' : '✗'} {data.time}
      </div>
    </div>
  );
}

const nodeTypes = {
  wallet: WalletNode,
  tx: TxNode,
};

const handleStyle = {
  width: 6, height: 6, background: 'var(--line-2)',
  border: 'none',
};

export function TxFlowGraph({ txs, address }: Props) {
  const { nodes, edges } = useMemo(() => {
    if (txs.length === 0) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addressMap = new Map<string, string>(); // address -> nodeId

    // Central wallet node
    const ownerId = 'owner';
    nodes.push({
      id: ownerId,
      type: 'wallet',
      position: { x: 300, y: 200 },
      data: { address, isOwner: true },
    });
    addressMap.set(address, ownerId);

    // Collect unique counterparties
    const counterparties = new Map<string, { address: string; txCount: number }>();
    for (const tx of txs) {
      const other = tx.from === address ? tx.to : tx.from;
      if (other && other !== address) {
        const existing = counterparties.get(other);
        counterparties.set(other, { address: other, txCount: (existing?.txCount || 0) + 1 });
      }
    }

    // Layout counterparties in a circle around owner
    const cpArray = Array.from(counterparties.values());
    const radius = 280;
    const centerX = 300;
    const centerY = 200;

    cpArray.forEach((cp, i) => {
      const angle = (i / Math.max(cpArray.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const nodeId = `cp-${i}`;
      addressMap.set(cp.address, nodeId);
      nodes.push({
        id: nodeId,
        type: 'wallet',
        position: { x, y },
        data: { address: cp.address, isOwner: false, totalAmount: `${cp.txCount} tx` },
      });
    });

    // Transaction nodes on the edges between wallets
    txs.forEach((tx, i) => {
      const other = tx.from === address ? tx.to : tx.from;
      const otherNodeId = addressMap.get(other || '');
      if (!otherNodeId) return;

      const txNodeId = `tx-${i}`;
      const ownerPos = nodes.find(n => n.id === ownerId)!.position;
      const otherPos = nodes.find(n => n.id === otherNodeId)!.position;

      // Position tx node between owner and counterparty
      const midX = (ownerPos.x + otherPos.x) / 2 + (Math.random() - 0.5) * 40;
      const midY = (ownerPos.y + otherPos.y) / 2 + (Math.random() - 0.5) * 40;

      const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const chainColor = CHAIN_COLORS[tx.chainId] || '#666';

      nodes.push({
        id: txNodeId,
        type: 'tx',
        position: { x: midX, y: midY },
        data: { ...tx, time: timeStr },
      });

      const isOutgoing = tx.from === address;

      edges.push({
        id: `e-${i}-a`,
        source: isOutgoing ? ownerId : txNodeId,
        target: isOutgoing ? txNodeId : ownerId,
        animated: true,
        style: { stroke: chainColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: chainColor, width: 12, height: 12 },
      });

      edges.push({
        id: `e-${i}-b`,
        source: isOutgoing ? txNodeId : otherNodeId,
        target: isOutgoing ? otherNodeId : txNodeId,
        animated: true,
        style: { stroke: chainColor, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: chainColor, width: 12, height: 12 },
      });
    });

    return { nodes, edges };
  }, [txs, address]);

  if (txs.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--ink-dim)', marginBottom: 12, letterSpacing: 2 }}>
        TRANSACTION FLOW
      </h3>
      <div style={{
        height: 500, borderRadius: 'var(--radius)', overflow: 'hidden',
        border: '1px solid var(--line)', background: '#0a0e1a',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0a0e1a' }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="rgba(255,255,255,0.03)" gap={24} />
          <Controls
            showInteractive={false}
            style={{ background: '#131829', borderColor: 'var(--line-2)' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
