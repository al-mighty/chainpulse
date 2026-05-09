const BASE = import.meta.env.VITE_API_URL || '/api/chainpulse';

async function json<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  getPortfolio: (address: string) => json<any>(`/portfolio/${address}`),
  getTransactions: (address: string, chain?: string) =>
    json<any[]>(`/tx/${address}${chain ? `?chain=${chain}` : ''}`),
  getPrices: (ids = 'solana,the-open-network') => json<Record<string, number>>(`/prices?ids=${ids}`),
};
