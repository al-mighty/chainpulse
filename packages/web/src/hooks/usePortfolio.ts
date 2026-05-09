import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function usePortfolio(address: string | null) {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) { setPortfolio(null); return; }
    setLoading(true);
    setError(null);
    api.getPortfolio(address)
      .then(setPortfolio)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  return { portfolio, loading, error };
}
