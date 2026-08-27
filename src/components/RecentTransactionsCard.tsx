import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatDate, getCategoryBadgeStyle } from '../utils/formatters';

interface RecentTransactionsCardProps {
  onViewAll: () => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({ onViewAll }) => {
  const { transactions } = usePortfolio();

  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="bg-[#101728] p-4 sm:p-6 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display font-bold text-lg text-white">
              Son İşlemler
            </h2>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Tümünü Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono-numeric">
          {recentTxs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-sans">
              Henüz işlem kaydı bulunmuyor.
            </div>
          ) : (
            recentTxs.map((tx) => {
              const isBuy = tx.type === 'buy';
              const isSell = tx.type === 'sell';
              const isDeposit = tx.type === 'deposit';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isBuy 
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : isSell 
                        ? 'bg-rose-500/15 text-rose-400' 
                        : 'bg-cyan-500/15 text-cyan-400'
                    }`}>
                      {isBuy ? <ArrowDownLeft className="w-3.5 h-3.5" /> : isSell ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="font-bold text-white text-xs">{tx.symbol}</span>
                        <span className={`px-1 rounded text-[9px] font-semibold ${
                          isBuy ? 'bg-emerald-500/20 text-emerald-300' : isSell ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {isBuy ? 'ALIŞ' : isSell ? 'SATIŞ' : 'YATIRMA'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {formatDate(tx.date || tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block text-xs">
                      {formatCurrency(tx.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {tx.shares > 1 && !isDeposit ? `${tx.shares} Adet` : tx.name.slice(0, 15)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-800/80">
        <button
          onClick={onViewAll}
          className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          İşlem Geçmişi Defterini Aç ({transactions.length})
        </button>
      </div>
    </div>
  );
};
