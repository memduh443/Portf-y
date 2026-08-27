import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const SummaryCards: React.FC = () => {
  const { summary } = usePortfolio();

  const isTotalProfit = summary.totalProfitLoss >= 0;
  const isDailyProfit = summary.dailyProfitLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      
      {/* 1. TOPLAM PORTFÖY DEĞERİ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#131b2e] to-[#0f1726] p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Toplam Portföy Değeri
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-numeric tracking-tight">
            {formatCurrency(summary.totalPortfolioValue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 mt-2 text-slate-400 font-mono-numeric">
          <span>Varlıklar: <strong className="text-slate-200">{formatCurrency(summary.totalAssetsValue, 0)}</strong></span>
          <span>Nakit: <strong className="text-amber-300">{formatCurrency(summary.cashBalance, 0)}</strong></span>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. TOPLAM YATIRILAN SERMAYE */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#131b2e] to-[#0f1726] p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Toplam Yatırılan Para
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-numeric tracking-tight">
            {formatCurrency(summary.totalInvested)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 mt-2 text-slate-400">
          <span>Pozisyon Sayısı</span>
          <span className="font-semibold text-slate-200 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
            {summary.assetCount} Farklı Varlık
          </span>
        </div>

        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. TOPLAM NET KÂR / ZARAR */}
      <div className={`relative overflow-hidden bg-gradient-to-b ${
        isTotalProfit ? 'from-[#0f2420] to-[#0d1a1b] border-emerald-500/30' : 'from-[#281318] to-[#1a0e12] border-rose-500/30'
      } p-4 sm:p-5 rounded-2xl border shadow-lg shadow-black/30`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Toplam Kâr / Zarar
          </span>
          <div className={`p-2 rounded-xl ${
            isTotalProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {isTotalProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className={`text-2xl sm:text-3xl font-display font-extrabold font-mono-numeric tracking-tight ${
            isTotalProfit ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isTotalProfit ? '+' : ''}{formatCurrency(summary.totalProfitLoss)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 mt-2">
          <span className="text-slate-400">Toplam Getiri:</span>
          <span className={`font-mono-numeric font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            isTotalProfit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isTotalProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {formatPercent(summary.totalProfitLossPercent)}
          </span>
        </div>

        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
          isTotalProfit ? 'bg-emerald-500/20' : 'bg-rose-500/20'
        }`} />
      </div>

      {/* 4. GÜNLÜK KÂR / ZARAR */}
      <div className={`relative overflow-hidden bg-gradient-to-b ${
        isDailyProfit ? 'from-[#0f2420] to-[#0d1a1b] border-emerald-500/30' : 'from-[#281318] to-[#1a0e12] border-rose-500/30'
      } p-4 sm:p-5 rounded-2xl border shadow-lg shadow-black/30`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Günlük Kâr / Zarar
          </span>
          <div className={`p-2 rounded-xl ${
            isDailyProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className={`text-2xl sm:text-3xl font-display font-extrabold font-mono-numeric tracking-tight ${
            isDailyProfit ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isDailyProfit ? '+' : ''}{formatCurrency(summary.dailyProfitLoss)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 mt-2">
          <span className="text-slate-400">Bugünkü Değişim:</span>
          <span className={`font-mono-numeric font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            isDailyProfit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isDailyProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {formatPercent(summary.dailyProfitLossPercent)}
          </span>
        </div>

        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
          isDailyProfit ? 'bg-emerald-500/20' : 'bg-rose-500/20'
        }`} />
      </div>

    </div>
  );
};
