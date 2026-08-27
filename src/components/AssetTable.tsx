import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown,
  RefreshCw,
  Eye,
  Plus,
  Layers,
  Sparkles,
  Bell,
  BellRing
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Asset, AssetCategory } from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  getCategoryBadgeStyle, 
  getCategoryLabel 
} from '../utils/formatters';

interface AssetTableProps {
  onOpenBuyModal: (prefillSymbol?: string) => void;
  onOpenSellModal: (asset: Asset) => void;
  onOpenEditModal: (asset: Asset) => void;
  onOpenPriceModal: (asset: Asset) => void;
  onOpenAlertModal?: (asset: Asset) => void;
}

type SortField = 'value' | 'pnl' | 'pnlPercent' | 'dailyChange' | 'shares' | 'symbol';
type SortOrder = 'asc' | 'desc';

export const AssetTable: React.FC<AssetTableProps> = ({
  onOpenBuyModal,
  onOpenSellModal,
  onOpenEditModal,
  onOpenPriceModal,
  onOpenAlertModal,
}) => {
  const { assets, deleteAsset, alerts } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Category filters
  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'bist', label: 'BIST Hisseleri' },
    { id: 'crypto', label: 'Kripto' },
    { id: 'gold', label: 'Altın & Emtia' },
    { id: 'fund', label: 'TEFAS Fon / ETF' },
    { id: 'fx', label: 'Döviz' },
  ];

  // Filtering & Sorting
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
        const matchesSearch = 
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let aVal = 0;
        let bVal = 0;

        switch (sortField) {
          case 'value':
            aVal = a.shares * a.currentPrice;
            bVal = b.shares * b.currentPrice;
            break;
          case 'pnl':
            aVal = (a.shares * a.currentPrice) - (a.shares * a.avgBuyPrice);
            bVal = (b.shares * b.currentPrice) - (b.shares * b.avgBuyPrice);
            break;
          case 'pnlPercent':
            aVal = a.avgBuyPrice > 0 ? ((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) : 0;
            bVal = b.avgBuyPrice > 0 ? ((b.currentPrice - b.avgBuyPrice) / b.avgBuyPrice) : 0;
            break;
          case 'dailyChange':
            aVal = a.dailyChangePercent;
            bVal = b.dailyChangePercent;
            break;
          case 'shares':
            aVal = a.shares;
            bVal = b.shares;
            break;
          case 'symbol':
            return sortOrder === 'asc' 
              ? a.symbol.localeCompare(b.symbol) 
              : b.symbol.localeCompare(a.symbol);
        }

        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [assets, selectedCategory, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-[#101728] rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white">
                Portföy Varlıkları
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                {filteredAssets.length} Pozisyon
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hisse, kripto, fon ve altın yatırımlarınızın güncel kâr/zarar dökümü
            </p>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sembol veya hisse ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0c121e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Add Asset Button */}
            <button
              onClick={() => onOpenBuyModal()}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Varlık Ekle</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-3 mt-1 border-t border-slate-800/60">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View (lg and up) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs font-mono-numeric">
          <thead className="bg-[#0b101c] text-slate-400 font-sans border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
            <tr>
              <th className="py-3 px-4 font-semibold">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-1 hover:text-white"
                >
                  <span>Varlık / Sembol</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => handleSort('shares')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white"
                >
                  <span>Adet / Miktar</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">Ort. Maliyet</th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => handleSort('dailyChange')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white"
                >
                  <span>Güncel Fiyat</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">Toplam Maliyet</th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white"
                >
                  <span>Toplam Değer</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 font-semibold text-right">
                <button
                  onClick={() => handleSort('pnl')}
                  className="flex items-center gap-1 justify-end w-full hover:text-white"
                >
                  <span>Net Kâr / Zarar</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 font-semibold text-center font-sans">Aksiyonlar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SlidersHorizontal className="w-8 h-8 text-slate-600" />
                    <p className="font-semibold text-slate-300">Bu filtrede gösterilecek varlık bulunamadı.</p>
                    <button
                      onClick={() => onOpenBuyModal()}
                      className="text-xs text-emerald-400 hover:underline font-bold mt-1"
                    >
                      + Yeni Varlık / Hisse Alış Kaydı Ekle
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const totalCost = asset.shares * asset.avgBuyPrice;
                const totalValue = asset.shares * asset.currentPrice;
                const pnl = totalValue - totalCost;
                const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
                const isProfit = pnl >= 0;
                const isDailyPositive = asset.dailyChangePercent >= 0;
                const badgeStyle = getCategoryBadgeStyle(asset.category);

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-display font-bold text-slate-200 text-xs border border-slate-700">
                          {asset.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-white text-sm">
                              {asset.symbol}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                            >
                              {getCategoryLabel(asset.category)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]" title={asset.name}>
                            {asset.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Shares */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-bold text-slate-200 text-sm">
                        {formatNumber(asset.shares, 0, 4)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Lot / Adet</span>
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      {formatCurrency(asset.avgBuyPrice)}
                    </td>

                    {/* Current Price & Daily % */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-white">
                        <span>{formatCurrency(asset.currentPrice)}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                          isDailyPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isDailyPositive ? '▲' : '▼'} {formatPercent(asset.dailyChangePercent)}
                      </span>
                    </td>

                    {/* Total Cost */}
                    <td className="py-3.5 px-3 text-right text-slate-400">
                      {formatCurrency(totalCost)}
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-display font-extrabold text-white text-sm">
                        {formatCurrency(totalValue)}
                      </span>
                    </td>

                    {/* Total PnL & % */}
                    <td className="py-3.5 px-3 text-right">
                      <div
                        className={`font-display font-bold text-sm ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}{formatCurrency(pnl)}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {formatPercent(pnlPercent)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Quick Buy */}
                        <button
                          onClick={() => onOpenBuyModal(asset.symbol)}
                          title="Hisse Alış Ekle"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Quick Sell */}
                        <button
                          onClick={() => onOpenSellModal(asset)}
                          title="Hisse Satış Yap"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        {/* Quick Price Update */}
                        <button
                          onClick={() => onOpenPriceModal(asset)}
                          title="Fiyat Güncelle"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Set Price Alert */}
                        {onOpenAlertModal && (
                          <button
                            onClick={() => onOpenAlertModal(asset)}
                            title="Fiyat Alarmı Kur"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit details */}
                        <button
                          onClick={() => onOpenEditModal(asset)}
                          title="Pozisyonu Düzenle"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete with confirmation */}
                        {confirmDeleteId === asset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                            >
                              Sil
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-1 rounded bg-slate-700 text-slate-300 text-[10px]"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(asset.id)}
                            title="Pozisyonu Sil"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card View (under lg) */}
      <div className="block lg:hidden divide-y divide-slate-800/80">
        {filteredAssets.length === 0 ? (
          <div className="py-10 px-4 text-center text-slate-400">
            <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">Bu kategoride varlık bulunamadı.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const totalCost = asset.shares * asset.avgBuyPrice;
            const totalValue = asset.shares * asset.currentPrice;
            const pnl = totalValue - totalCost;
            const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
            const isProfit = pnl >= 0;
            const badgeStyle = getCategoryBadgeStyle(asset.category);

            return (
              <div key={asset.id} className="p-4 space-y-3 font-mono-numeric">
                
                {/* Card Top: Symbol, Name, Badge, Actions */}
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-display font-bold text-white text-xs">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-extrabold text-base text-white">
                          {asset.symbol}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {getCategoryLabel(asset.category)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {asset.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-white text-base">
                      {formatCurrency(totalValue)}
                    </span>
                    <div
                      className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                    </div>
                  </div>
                </div>

                {/* Card Middle: Key metrics grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#0c121e] p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Adet</span>
                    <span className="font-bold text-slate-200">{formatNumber(asset.shares, 0, 4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Ort. Maliyet</span>
                    <span className="font-medium text-slate-300">{formatCurrency(asset.avgBuyPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Güncel Fiyat</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(asset.currentPrice)}</span>
                  </div>
                </div>

                {/* Card Bottom: Action buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 font-sans">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => onOpenBuyModal(asset.symbol)}
                      className="flex-1 py-1.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all border border-emerald-500/30"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Al</span>
                    </button>
                    <button
                      onClick={() => onOpenSellModal(asset)}
                      className="flex-1 py-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all border border-rose-500/30"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>Sat</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenPriceModal(asset)}
                      title="Fiyat Güncelle"
                      className="p-1.5 bg-slate-800 text-slate-300 rounded-lg"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {onOpenAlertModal && (
                      <button
                        onClick={() => onOpenAlertModal(asset)}
                        title="Fiyat Alarmı Kur"
                        className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onOpenEditModal(asset)}
                      title="Düzenle"
                      className="p-1.5 bg-slate-800 text-slate-300 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      title="Sil"
                      className="p-1.5 bg-slate-800 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
