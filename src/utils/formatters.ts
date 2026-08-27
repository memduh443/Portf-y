export const formatCurrency = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatNumber = (value: number, minDecimals = 0, maxDecimals = 2): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
};

export const formatPercent = (value: number, showSign = true): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')}%`;
};

export const formatDate = (dateStr: string | number): string => {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'bist':
      return 'BIST Hisse';
    case 'crypto':
      return 'Kripto';
    case 'gold':
      return 'Altın / Emtia';
    case 'fund':
      return 'TEFAS Fon';
    case 'fx':
      return 'Döviz';
    case 'cash':
      return 'Nakit';
    default:
      return 'Varlık';
  }
};

export const getCategoryBadgeStyle = (category: string): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'bist':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'crypto':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
    case 'gold':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'fund':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'fx':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'cash':
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
};
