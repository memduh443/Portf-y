export type AssetCategory = 'bist' | 'crypto' | 'gold' | 'fund' | 'fx' | 'cash';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  shares: number;           // Adet / Miktar
  avgBuyPrice: number;       // Ortalama Alış Fiyatı (TL)
  currentPrice: number;      // Güncel Fiyat (TL)
  dailyChangePercent: number;// Günlük Değişim (%)
  notes?: string;
  updatedAt: number;
}

export type TransactionType = 'buy' | 'sell' | 'deposit' | 'withdraw';

export interface Transaction {
  id: string;
  assetId?: string;
  symbol: string;
  name: string;
  type: TransactionType;
  category: AssetCategory;
  shares: number;
  price: number;
  totalAmount: number;
  commission: number;
  realizedPnL?: number; // Gerçekleşen Kâr/Zarar (TL)
  date: string;         // YYYY-MM-DD or ISO
  note?: string;
  createdAt: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: string;
  peRatio?: number;      // F/K
  pbRatio?: number;      // PD/DD
  support?: number;     // Destek
  resistance?: number;  // Direnç
  sector?: string;
}

export type MarketIdeaHorizon = 'short' | 'medium' | 'watchlist';

export interface MarketIdea {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  horizon: MarketIdeaHorizon;
  tag: string;
  signal: 'GÜÇLÜ AL' | 'KADEMELİ AL' | 'DİKKATLE İZLE' | 'TREND TAKİP';
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  potentialPercent: number;
  criteria: {
    momentum: number; // 0 - 100
    volumeTrend: string;
    fundamentals: string;
    sector: string;
  };
  analysisText: string;
  keyDrivers: string[];
}

export interface PortfolioSummary {
  totalAssetsValue: number;
  cashBalance: number;
  totalPortfolioValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyProfitLoss: number;
  dailyProfitLossPercent: number;
  assetCount: number;
}

export interface CategoryDistribution {
  category: AssetCategory;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  targetPrice: number;
  condition: AlertCondition; // 'ABOVE' (>= hedef fiyat) or 'BELOW' (<= hedef fiyat)
  initialPrice: number;
  triggered: boolean;
  triggeredAt?: number;
  triggeredPrice?: number;
  createdAt: number;
  active: boolean;
  note?: string;
}
