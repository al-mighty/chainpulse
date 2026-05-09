import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { TYPES } from '../constants';
import type { ChainPulseConfig } from '../types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

@injectable()
export class PriceService {
  private cache = new Map<string, { price: number; ts: number }>();
  private cacheTtl = 60_000; // 60s

  constructor(@inject(TYPES.Config) private config: ChainPulseConfig) {}

  async getPrice(coingeckoId: string): Promise<number> {
    const cached = this.cache.get(coingeckoId);
    if (cached && Date.now() - cached.ts < this.cacheTtl) return cached.price;

    try {
      const url = `${COINGECKO_BASE}/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
      const res = await fetch(url);
      const data = await res.json();
      const price = data[coingeckoId]?.usd || 0;
      this.cache.set(coingeckoId, { price, ts: Date.now() });
      return price;
    } catch {
      return cached?.price || 0;
    }
  }

  async getPrices(ids: string[]): Promise<Record<string, number>> {
    const unique = [...new Set(ids)];
    const results: Record<string, number> = {};

    const uncached = unique.filter(id => {
      const c = this.cache.get(id);
      if (c && Date.now() - c.ts < this.cacheTtl) { results[id] = c.price; return false; }
      return true;
    });

    if (uncached.length > 0) {
      try {
        const url = `${COINGECKO_BASE}/simple/price?ids=${uncached.join(',')}&vs_currencies=usd`;
        const res = await fetch(url);
        const data = await res.json();
        for (const id of uncached) {
          const price = data[id]?.usd || 0;
          results[id] = price;
          this.cache.set(id, { price, ts: Date.now() });
        }
      } catch {
        for (const id of uncached) results[id] = this.cache.get(id)?.price || 0;
      }
    }

    return results;
  }
}
