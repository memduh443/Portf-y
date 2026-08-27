import React, { useState } from 'react';
import { 
  Bookmark, 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  X,
  ExternalLink,
  DollarSign,
  Bell
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AVAILABLE_MARKET_SYMBOLS } from '../data/initialData';
import { AssetCategory, WatchlistItem } from '../types';
import { 
  formatCurrency, 
  formatPercent, 
  getCategoryBadgeStyle, 
  getCategoryLabel 
} from '../utils/formatters';

interface WatchlistSectionProps {
  onOpenBuyModal: (symbol?: string) => void;
  onOpenAlertModal?: (asset: { symbol: string; name: string; category: AssetCategory; currentPrice: number }) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({ 
  onOpenBuyModal,
  onOpenAlertModal 
}) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add custom watchlist item state
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<AssetCategory>('bist');
  const [customPrice, setCustomPrice] = useState('');
  const [customSupport, setCustomSupport] = useState('');
  const [customResistance, setCustomResistance] = useState('');

  const filteredWatchlist = watchlist.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymbol.trim()) return;

    const sym = customSymbol.trim().toUpperCase();
    const existingPreset = AVAILABLE_MARKET_SYMBOLS.find(
      (s) => s.symbol.toUpperCase() === sym
    );

    const price = parseFloat(customPrice) || existingPreset?.defaultPrice || 100;

    await addToWatchlist({
      symbol: sym,
      name: customName.trim() || existingPreset?.name || sym,
      category: customCategory,
      price,
      changePercent: +(Math.random() * 3 - 1).toFixed(2),
      support: customSupport ? parseFloat(customSupport) : undefined,
      resistance: customResistance ? parseFloat(customResistance) : undefined,
    });

    setIsAddModalOpen(false);
    setCustomSymbol('');
    setCustomName('');
    setCustomPrice('');
    setCustomSupport('');
    setCustomResistance('');
  };

  const handleSelectPreset = (preset: typeof AVAILABLE_MARKET_SYMBOLS[0]) => {
    setCustomSymbol(preset.symbol);
    setCustomName(preset.name);
    setCustomCategory(preset.category);
    setCustomPrice(preset.defaultPrice.toString());
  };

  return (
    <div className="bg-[#101728] rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-white">
                İzleme Listesi (Favoriler)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                {watchlist.length} Takip Edilen
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Alım fırsatı kolladığınız hisse ve varlıkların anlık fiyat ve teknik seviyeleri
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Favorilerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0c121e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İzlemeye Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Watchlist Items */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredWatchlist.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-sans">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">İzleme listenizde varlık bulunmuyor.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-amber-400 hover:underline font-bold mt-1"
            >
              + Takip Listenize Yeni Hisse / Varlık Ekleyin
            </button>
          </div>
        ) : (
          filteredWatchlist.map((item) => {
            const isPositive = item.changePercent >= 0;
            const badgeStyle = getCategoryBadgeStyle(item.category);

            return (
              <div
                key={item.id}
                className="bg-[#0c121e] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Bar: Symbol, Category, Delete */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-display font-bold text-white text-xs border border-slate-700">
                        {item.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-black text-white text-base">
                            {item.symbol}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {item.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {onOpenAlertModal && (
                        <button
                          onClick={() => onOpenAlertModal({
                            symbol: item.symbol,
                            name: item.name,
                            category: item.category,
                            currentPrice: item.price
                          })}
                          title="Fiyat Alarmı Kur"
                          className="p-1 rounded-lg text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        title="İzleme Listesinden Kaldır"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Daily Change */}
                  <div className="flex items-baseline justify-between my-3 font-mono-numeric">
                    <span className="font-display font-extrabold text-xl text-white">
                      {formatCurrency(item.price)}
                    </span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                      isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>

                  {/* Support / Resistance / Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-[#121929] p-2.5 rounded-xl border border-slate-800/80 mb-3 text-xs font-mono-numeric">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">Destek Seviyesi</span>
                      <span className="font-semibold text-slate-300">
                        {item.support ? formatCurrency(item.support) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">Direnç Seviyesi</span>
                      <span className="font-semibold text-emerald-400">
                        {item.resistance ? formatCurrency(item.resistance) : '-'}
                      </span>
                    </div>
                    {item.peRatio && (
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">F/K Çarpanı</span>
                        <span className="font-semibold text-slate-200">{item.peRatio}</span>
                      </div>
                    )}
                    {item.volume && (
                      <div>
                        <span className="text-slate-500 block text-[10px] font-sans">Günlük Hacim</span>
                        <span className="font-semibold text-slate-200">{item.volume}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => onOpenBuyModal(item.symbol)}
                  className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Portföye Alış Ekle</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add to Watchlist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101728] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">
                  İzleme Listesine Ekle
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick preset pills */}
            <div>
              <label className="block text-slate-400 text-xs mb-1">Popüler Hisselerden Seç:</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_MARKET_SYMBOLS.slice(0, 8).map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 font-mono-numeric"
                  >
                    {p.symbol}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sembol / Kod *</label>
                <input
                  type="text"
                  placeholder="Örn: THYAO, EREGL"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Varlık / Şirket Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Türk Hava Yolları"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Güncel Fiyat (TL)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="312.50"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="bist">BIST Hisse</option>
                    <option value="crypto">Kripto</option>
                    <option value="gold">Altın / Emtia</option>
                    <option value="fund">TEFAS Fon</option>
                    <option value="fx">Döviz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destek Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="300"
                    value={customSupport}
                    onChange={(e) => setCustomSupport(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Direnç Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="335"
                    value={customResistance}
                    onChange={(e) => setCustomResistance(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
