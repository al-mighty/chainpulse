export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAmount(amount: number, decimals = 4): string {
  if (amount === 0) return '0';
  if (amount < 0.0001) return '<0.0001';
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}
