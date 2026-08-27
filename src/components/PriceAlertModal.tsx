import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  Sliders, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AssetCategory, AlertCondition, PriceAlert } from '../types';
import { AVAILABLE_MARKET_SYMBOLS } from '../data/initialData';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedAsset?: {
    symbol: string;
    name: string;
    category: AssetCategory;
    currentPrice: number;
  } | null;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  preSelectedAsset,
}) => {
  const { 
    alerts, 
    assets, 
    watchlist, 
    addAlert, 
    deleteAlert, 
    toggleAlertActive, 
    rearmAlert, 
    testAlertNotification,
    notificationPermission,
    requestBrowserPermission
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'triggered'>('all');

  // Form State
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [category, setCategory] = useState<AssetCategory>('bist');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Combined searchable asset pool (Portfolio + Watchlist + Popular Market Templates)
  const availableAssetPool = useMemo(() => {
    const map = new Map<string, { symbol: string; name: string; category: AssetCategory; price: number; inPortfolio: boolean }>();

    // 1. Portfolio assets
    assets.forEach(a => {
      map.set(a.symbol.toUpperCase(), {
        symbol: a.symbol.toUpperCase(),
        name: a.name,
        category: a.category,
        price: a.currentPrice,
        inPortfolio: true,
      });
    });

    // 2. Watchlist items
    watchlist.forEach(w => {
      if (!map.has(w.symbol.toUpperCase())) {
        map.set(w.symbol.toUpperCase(), {
          symbol: w.symbol.toUpperCase(),
          name: w.name,
          category: w.category,
          price: w.price,
          inPortfolio: false,
        });
      }
    });

    // 3. Popular templates
    AVAILABLE_MARKET_SYMBOLS.forEach(p => {
      if (!map.has(p.symbol.toUpperCase())) {
        map.set(p.symbol.toUpperCase(), {
          symbol: p.symbol.toUpperCase(),
          name: p.name,
          category: p.category,
          price: p.defaultPrice,
          inPortfolio: false,
        });
      }
    });

    return Array.from(map.values());
  }, [assets, watchlist]);

  // If opened with preSelectedAsset
  useEffect(() => {
    if (preSelectedAsset) {
      setSelectedSymbol(preSelectedAsset.symbol);
      setAssetName(preSelectedAsset.name);
      setCategory(preSelectedAsset.category);
      setCurrentPrice(preSelectedAsset.currentPrice);
      // Default to 5% above
      const defaultTarget = Number((preSelectedAsset.currentPrice * 1.05).toFixed(2));
      setTargetPrice(defaultTarget.toString());
      setCondition('ABOVE');
      setActiveTab('create');
    } else if (availableAssetPool.length > 0 && !selectedSymbol) {
      const first = availableAssetPool[0];
      setSelectedSymbol(first.symbol);
      setAssetName(first.name);
      setCategory(first.category);
      setCurrentPrice(first.price);
      setTargetPrice((first.price * 1.05).toFixed(2));
    }
  }, [preSelectedAsset, isOpen]);

  // Handle asset selection change
  const handleSelectAsset = (symbol: string) => {
    const found = availableAssetPool.find(a => a.symbol === symbol);
    if (found) {
      setSelectedSymbol(found.symbol);
      setAssetName(found.name);
      setCategory(found.category);
      setCurrentPrice(found.price);
      // Default target price +5%
      const newTarget = Number((found.price * (condition === 'ABOVE' ? 1.05 : 0.95)).toFixed(2));
      setTargetPrice(newTarget.toString());
    }
  };

  // Quick percentage buttons
  const applyQuickPercent = (pct: number) => {
    if (!currentPrice || currentPrice <= 0) return;
    const calc = currentPrice * (1 + pct / 100);
    setTargetPrice(calc.toFixed(calc < 10 ? 3 : 2));
    if (pct > 0) {
      setCondition('ABOVE');
    } else if (pct < 0) {
      setCondition('BELOW');
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetPrice);
    if (!selectedSymbol || isNaN(numTarget) || numTarget <= 0) {
      alert('Lütfen geçerli bir hedef fiyat giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAlert({
        symbol: selectedSymbol,
        name: assetName || selectedSymbol,
        category,
        targetPrice: numTarget,
        condition,
        initialPrice: currentPrice || numTarget,
        note: note || undefined,
      });

      // Reset & go back to list
      setNote('');
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filterMode === 'active') return a.active && !a.triggered;
      if (filterMode === 'triggered') return a.triggered;
      return true;
    });
  }, [alerts, filterMode]);

  // Stats
  const activeCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        id="price-alert-modal-card" 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#131d33]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Fiyat Alarm Sistemi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Canlı Takip
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hedef seviyelerde anlık tarayıcı bildirimi ve sesli uyarı alın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-slate-800/80 bg-[#0d1424] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Alarmlarım ({alerts.length})
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Alarm Kur
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'all'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tümü ({alerts.length})
              </button>
              <button
                onClick={() => setFilterMode('active')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Aktif ({activeCount})
              </button>
              <button
                onClick={() => setFilterMode('triggered')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'triggered'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tetiklenen ({triggeredCount})
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Notification Permission & Test Notice */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${
                notificationPermission === 'granted' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {notificationPermission === 'granted' ? <ShieldCheck className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-semibold text-slate-200">
                  {notificationPermission === 'granted' 
                    ? 'Tarayıcı Bildirimleri Aktif' 
                    : 'Tarayıcı Bildirim İzni Gerekli'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {notificationPermission === 'granted'
                    ? 'Sekme arka planda olsa bile hedef fiyat seviyelerinde uyarı alırsınız.'
                    : 'Fiyat hedefine ulaşıldığında masaüstü uyarısı almak için izni etkinleştirin.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => requestBrowserPermission()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  İzin Ver
                </button>
              )}

              <button
                type="button"
                onClick={() => testAlertNotification(selectedSymbol || 'ASELS')}
                title="Sesli ve görsel test bildirimi gönder"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Test Alarmı Çal
              </button>
            </div>
          </div>

          {/* TAB 1: LIST ALERTS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
                  <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-300">
                    {filterMode === 'all' 
                      ? 'Henüz kurulmuş bir fiyat alarmı bulunmuyor.' 
                      : filterMode === 'active' 
                        ? 'Şu anda bekleyen aktif bir alarm yok.' 
                        : 'Henüz tetiklenen bir alarm geçmişi yok.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Takip etmek istediğiniz hisse, kripto veya emtia için hedef fiyat belirleyerek anında haberdar olun.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    İlk Alarmı Kur
                  </button>
                </div>
              ) : (
                filteredAlerts.map((alertItem) => {
                  // Find current live price
                  const liveAsset = assets.find(a => a.symbol.toUpperCase() === alertItem.symbol.toUpperCase());
                  const liveWatch = !liveAsset ? watchlist.find(w => w.symbol.toUpperCase() === alertItem.symbol.toUpperCase()) : null;
                  const livePrice = liveAsset ? liveAsset.currentPrice : liveWatch ? liveWatch.price : alertItem.initialPrice;

                  // Distance calculation
                  const priceDiff = alertItem.targetPrice - livePrice;
                  const diffPercent = livePrice > 0 ? (priceDiff / livePrice) * 100 : 0;
                  const isAbove = alertItem.condition === 'ABOVE';

                  return (
                    <div
                      key={alertItem.id}
                      className={`p-4 rounded-xl border transition-all ${
                        alertItem.triggered
                          ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                          : alertItem.active
                            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/50 border-slate-800/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl font-mono-numeric font-bold text-xs flex items-center justify-center shrink-0 ${
                            alertItem.triggered
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isAbove
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isAbove ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm sm:text-base">
                                {alertItem.symbol}
                              </span>
                              <span className="text-xs text-slate-400">
                                {alertItem.name}
                              </span>

                              {alertItem.triggered ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                                  <CheckCircle2 className="w-3 h-3" />
                                  HEDEFE ULAŞTI
                                </span>
                              ) : alertItem.active ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  Canlı Takipte
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                  Pasif
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-1.5 text-xs">
                              <div>
                                <span className="text-slate-500">Hedef: </span>
                                <span className="font-bold text-amber-400 font-mono-numeric">
                                  {formatCurrency(alertItem.targetPrice)}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-1">
                                  ({isAbove ? '≥ Üzerine' : '≤ Altına'})
                                </span>
                              </div>

                              <div className="border-l border-slate-800 pl-3">
                                <span className="text-slate-500">Güncel: </span>
                                <span className="font-semibold text-slate-200 font-mono-numeric">
                                  {formatCurrency(livePrice)}
                                </span>
                              </div>

                              {!alertItem.triggered && (
                                <div className="border-l border-slate-800 pl-3 text-[11px]">
                                  <span className="text-slate-500">Kalan: </span>
                                  <span className={`font-mono-numeric font-medium ${
                                    Math.abs(diffPercent) < 2 ? 'text-amber-400 font-bold' : 'text-slate-300'
                                  }`}>
                                    {Math.abs(diffPercent).toFixed(1)}% {diffPercent > 0 ? 'yükseliş' : 'düşüş'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {alertItem.note && (
                              <p className="text-[11px] text-slate-400 mt-1 italic">
                                &ldquo;{alertItem.note}&rdquo;
                              </p>
                            )}

                            {alertItem.triggered && alertItem.triggeredPrice && (
                              <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block font-mono-numeric">
                                🔔 {new Date(alertItem.triggeredAt || Date.now()).toLocaleTimeString('tr-TR')} saatinde ₺{alertItem.triggeredPrice.toFixed(2)} fiyatında tetiklendi.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {alertItem.triggered ? (
                            <button
                              onClick={() => rearmAlert(alertItem.id)}
                              title="Alarmı Yeniden Kur (Tetiklenmeyi Sıfırla)"
                              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Yeniden Kur</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAlertActive(alertItem.id)}
                              title={alertItem.active ? 'Alarmı Duraklat' : 'Alarmı Etkinleştir'}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                alertItem.active
                                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
                              }`}
                            >
                              {alertItem.active ? 'Pasife Al' : 'Aktif Et'}
                            </button>
                          )}

                          <button
                            onClick={() => deleteAlert(alertItem.id)}
                            title="Alarmı Sil"
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CREATE NEW ALERT FORM */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAlert} className="space-y-4">
              
              {/* Asset Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Varlık Seçiniz
                </label>
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => handleSelectAsset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <optgroup label="Portföyümdeki Varlıklar">
                      {assets.map(a => (
                        <option key={a.id} value={a.symbol.toUpperCase()}>
                          {a.symbol} - {a.name} (₺{a.currentPrice.toFixed(2)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="İzleme Listesi & Popüler Varlıklar">
                      {availableAssetPool.filter(a => !a.inPortfolio).map(p => (
                        <option key={p.symbol} value={p.symbol.toUpperCase()}>
                          {p.symbol} - {p.name} (₺{p.price.toFixed(2)})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Current Price Banner */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Seçilen Varlık Güncel Fiyatı:</span>
                <span className="font-bold text-base text-emerald-400 font-mono-numeric">
                  {formatCurrency(currentPrice)}
                </span>
              </div>

              {/* Condition Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alarm Koşulu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCondition('ABOVE');
                      if (currentPrice > 0 && (!targetPrice || parseFloat(targetPrice) < currentPrice)) {
                        setTargetPrice((currentPrice * 1.05).toFixed(currentPrice < 10 ? 3 : 2));
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      condition === 'ABOVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Fiyat Üzerine Çıkınca (≥)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCondition('BELOW');
                      if (currentPrice > 0 && (!targetPrice || parseFloat(targetPrice) > currentPrice)) {
                        setTargetPrice((currentPrice * 0.95).toFixed(currentPrice < 10 ? 3 : 2));
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      condition === 'BELOW'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 ring-1 ring-rose-500/30'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    Fiyat Altına İnince (≤)
                  </button>
                </div>
              </div>

              {/* Target Price & Quick Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Hedef Fiyat (TL)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Hızlı Yüzde Belirle:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₺
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-base font-bold text-white font-mono-numeric focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Quick % buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(-15)}
                    className="py-1 px-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 text-[11px] font-semibold transition-colors"
                  >
                    -%15
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(-10)}
                    className="py-1 px-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 text-[11px] font-semibold transition-colors"
                  >
                    -%10
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(-5)}
                    className="py-1 px-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 text-[11px] font-semibold transition-colors"
                  >
                    -%5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(-2)}
                    className="py-1 px-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 text-[11px] font-semibold transition-colors"
                  >
                    -%2
                  </button>

                  <button
                    type="button"
                    onClick={() => applyQuickPercent(2)}
                    className="py-1 px-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/40 text-[11px] font-semibold transition-colors"
                  >
                    +%2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(5)}
                    className="py-1 px-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/40 text-[11px] font-semibold transition-colors"
                  >
                    +%5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(10)}
                    className="py-1 px-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/40 text-[11px] font-semibold transition-colors"
                  >
                    +%10
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickPercent(20)}
                    className="py-1 px-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/40 text-[11px] font-semibold transition-colors"
                  >
                    +%20
                  </button>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alarm Notu (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Örn: Direnç kırılımı durumunda kâr al / Alım fırsatı"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <BellRing className="w-4 h-4" />
                  {isSubmitting ? 'Kaydediliyor...' : 'Alarmı Oluştur'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-800 bg-[#0d1424] flex items-center justify-between text-xs text-slate-400">
          <span>
            Toplam <strong className="text-white">{alerts.length}</strong> alarm kayıtlı
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
