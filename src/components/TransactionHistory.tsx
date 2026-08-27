import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Calendar, 
  Tag, 
  Layers, 
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Transaction, TransactionType } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatNumber, 
  getCategoryBadgeStyle, 
  getCategoryLabel 
} from '../utils/formatters';

export const TransactionHistory: React.FC = () => {
  const { transactions } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesSearch =
          tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [transactions, typeFilter, searchQuery]);

  const typeTabs = [
    { id: 'all', label: 'Tüm İşlemler' },
    { id: 'buy', label: 'Alışlar' },
    { id: 'sell', label: 'Satışlar' },
    { id: 'deposit', label: 'Para Yatırma' },
    { id: 'withdraw', label: 'Para Çekme' },
  ];

  return (
    <div className="bg-[#101728] rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 overflow-hidden">
      
      {/* Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display font-bold text-lg text-white">
                İşlem Geçmişi Defteri
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                {filteredTransactions.length} Kayıt
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Portföyünüze manuel olarak girdiğiniz tüm alım, satım ve sermaye hareketleri
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İşlem veya hisse ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0c121e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-3 mt-1 border-t border-slate-800/60">
          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === tab.id
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-mono-numeric">
          <thead className="bg-[#0b101c] text-slate-400 font-sans border-b border-slate-800 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Tarih</th>
              <th className="py-3 px-4 font-semibold">Varlık / Sembol</th>
              <th className="py-3 px-3 font-semibold text-center">İşlem Türü</th>
              <th className="py-3 px-3 font-semibold text-right">Adet</th>
              <th className="py-3 px-3 font-semibold text-right">Birim Fiyat</th>
              <th className="py-3 px-3 font-semibold text-right">Toplam Tutar</th>
              <th className="py-3 px-3 font-semibold text-right">Gerçekleşen Kâr/Zarar</th>
              <th className="py-3 px-4 font-semibold font-sans">Not</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                  Kayıtlı işlem geçmişi bulunamadı.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const badgeStyle = getCategoryBadgeStyle(tx.category);
                const isBuy = tx.type === 'buy';
                const isSell = tx.type === 'sell';
                const isDeposit = tx.type === 'deposit';
                const isWithdraw = tx.type === 'withdraw';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(tx.date || tx.createdAt)}
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-xs">
                          {tx.symbol}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {getCategoryLabel(tx.category)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                        {tx.name}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3 text-center font-sans">
                      {isBuy && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ALIŞ
                        </span>
                      )}
                      {isSell && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          SATIŞ
                        </span>
                      )}
                      {isDeposit && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          PARA YATIRMA
                        </span>
                      )}
                      {isWithdraw && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          PARA ÇEKME
                        </span>
                      )}
                    </td>

                    {/* Shares */}
                    <td className="py-3.5 px-3 text-right text-slate-200">
                      {isDeposit || isWithdraw ? '-' : formatNumber(tx.shares, 0, 4)}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      {isDeposit || isWithdraw ? '-' : formatCurrency(tx.price)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-3 text-right font-bold text-white">
                      {formatCurrency(tx.totalAmount)}
                    </td>

                    {/* Realized PnL */}
                    <td className="py-3.5 px-3 text-right">
                      {tx.realizedPnL !== undefined ? (
                        <span
                          className={`font-bold ${
                            tx.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.realizedPnL >= 0 ? '+' : ''}{formatCurrency(tx.realizedPnL)}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-sans truncate max-w-[200px]" title={tx.note}>
                      {tx.note || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction List Mobile Cards */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Kayıtlı işlem bulunamadı.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isBuy = tx.type === 'buy';
            const isSell = tx.type === 'sell';
            const isDeposit = tx.type === 'deposit';

            return (
              <div key={tx.id} className="p-4 space-y-2 font-mono-numeric">
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-white">
                      {tx.symbol}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400' : isSell ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {isBuy ? 'ALIŞ' : isSell ? 'SATIŞ' : isDeposit ? 'YATIRMA' : 'ÇEKME'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {formatDate(tx.date || tx.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-sans">
                    {tx.shares > 1 && !isDeposit ? `${tx.shares} Adet x ${formatCurrency(tx.price)}` : tx.name}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {formatCurrency(tx.totalAmount)}
                  </span>
                </div>

                {tx.realizedPnL !== undefined && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400 font-sans">Gerçekleşen Kâr/Zarar:</span>
                    <span className={`font-bold ${tx.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.realizedPnL >= 0 ? '+' : ''}{formatCurrency(tx.realizedPnL)}
                    </span>
                  </div>
                )}

                {tx.note && (
                  <p className="text-[11px] text-slate-500 font-sans italic">
                    "{tx.note}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
