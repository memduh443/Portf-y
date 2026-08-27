import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Info, 
  Check, 
  Search, 
  Wallet, 
  Calendar, 
  Tag, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AssetCategory } from '../types';
import { AVAILABLE_MARKET_SYMBOLS } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';

interface BuyAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillSymbol?: string;
}

export const BuyAssetModal: React.FC<BuyAssetModalProps> = ({
  isOpen,
  onClose,
  prefillSymbol,
}) => {
  const { buyAsset, cashBalance } = usePortfolio();

  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('bist');
  const [shares, setShares] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [commission, setCommission] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [deductFromCash, setDeductFromCash] = useState<boolean>(true);
  const [searchSuggestions, setSearchSuggestions] = useState<typeof AVAILABLE_MARKET_SYMBOLS>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill when opened
  useEffect(() => {
    if (prefillSymbol) {
      const found = AVAILABLE_MARKET_SYMBOLS.find(
        (s) => s.symbol.toUpperCase() === prefillSymbol.toUpperCase()
      );
      if (found) {
        setSymbol(found.symbol);
        setName(found.name);
        setCategory(found.category);
        setPrice(found.defaultPrice.toString());
      } else {
        setSymbol(prefillSymbol);
      }
    } else {
      setSymbol('');
      setName('');
      setShares('');
      setPrice('');
      setCommission('0');
      setNote('');
    }
    setErrorMessage(null);
  }, [prefillSymbol, isOpen]);

  if (!isOpen) return null;

  // Handle symbol autocomplete
  const handleSymbolChange = (val: string) => {
    const text = val.toUpperCase();
    setSymbol(text);
    if (text.length > 0) {
      const matches = AVAILABLE_MARKET_SYMBOLS.filter(
        (item) => item.symbol.includes(text) || item.name.toUpperCase().includes(text)
      ).slice(0, 6);
      setSearchSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSymbol = (item: typeof AVAILABLE_MARKET_SYMBOLS[0]) => {
    setSymbol(item.symbol);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.defaultPrice.toString());
    setShowSuggestions(false);
  };

  // Calculations
  const numericShares = parseFloat(shares) || 0;
  const numericPrice = parseFloat(price) || 0;
  const numericCommission = parseFloat(commission) || 0;
  const totalAmount = numericShares * numericPrice + numericCommission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!symbol.trim()) {
      setErrorMessage('Lütfen geçerli bir hisse / varlık sembolü giriniz.');
      return;
    }
    if (numericShares <= 0) {
      setErrorMessage('Lütfen 0\'dan büyük bir adet / lot miktarı giriniz.');
      return;
    }
    if (numericPrice <= 0) {
      setErrorMessage('Lütfen 0\'dan büyük bir birim alış fiyatı giriniz.');
      return;
    }

    if (deductFromCash && totalAmount > cashBalance) {
      const proceed = window.confirm(
        `Nakit bakiyeniz (${formatCurrency(cashBalance)}) bu alım tutarından (${formatCurrency(totalAmount)}) düşüktür. Yine de nakit bakiyesini sıfırlayıp alımı kaydetmek istiyor musunuz?`
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      await buyAsset({
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim().toUpperCase(),
        category,
        shares: numericShares,
        price: numericPrice,
        commission: numericCommission,
        date,
        note: note.trim(),
        deductFromCash,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'İşlem kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#101728] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={() => setShowSuggestions(false)}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#101728] to-[#132038]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Manuel Hisse / Varlık Alışı
              </h3>
              <p className="text-[11px] text-slate-400">
                Aracı kurumunuzdan aldığınız varlığı portföyünüze ekleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs">
          
          {/* Important Regulatory / Informational Banner */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Önemli Bilgilendirme:</strong> Bu işlem gerçek bir banka satın alması <strong>yapmaz</strong>. Bankanızdan veya aracı kurumunuzdan aldığınız hisseleri portföyünüzde takip etmek için manuel olarak kaydetmenizi sağlar.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Varlık Türü / Category Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Varlık Kategorisi
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'bist', label: 'BIST Hisse' },
                { id: 'crypto', label: 'Kripto' },
                { id: 'gold', label: 'Altın / Emtia' },
                { id: 'fund', label: 'TEFAS Fon' },
                { id: 'fx', label: 'Döviz' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as AssetCategory)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    category === cat.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Symbol & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            
            {/* Symbol Autocomplete */}
            <div className="relative">
              <label className="block text-slate-300 font-semibold mb-1">
                Hisse / Varlık Kodu <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Örn: ASELS, THYAO, BTC"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                onFocus={() => {
                  if (symbol) handleSymbolChange(symbol);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold uppercase focus:outline-none focus:border-emerald-500"
                required
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div 
                  className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#131b2e] border border-slate-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchSuggestions.map((item) => (
                    <button
                      type="button"
                      key={item.symbol}
                      onClick={() => handleSelectSymbol(item)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white text-xs">{item.symbol}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[170px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono-numeric text-xs font-semibold">
                        {formatCurrency(item.defaultPrice)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Full Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Şirket / Varlık Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Aselsan Elektronik"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Shares (Adet) & Unit Buy Price (Alış Fiyatı) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alınan Adet / Lot <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                placeholder="Örn: 50"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Birim Alış Fiyatı (TL) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                placeholder="Örn: 395.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Date & Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İşlem Tarihi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Aracı Kurum Komisyonu (TL)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              İşlem Notu (İsteğe Bağlı)
            </label>
            <input
              type="text"
              placeholder="Örn: Aylık düzenli ekleme, BIST 30 savunma pozisyonu"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cash Deduction Option */}
          <div className="p-3 bg-[#0c121e] rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deductCash"
                checked={deductFromCash}
                onChange={(e) => setDeductFromCash(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="deductCash" className="text-xs text-slate-300 cursor-pointer font-medium">
                Bu tutarı mevcut nakit bakiyemden düş ({formatCurrency(cashBalance, 0)})
              </label>
            </div>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-gradient-to-r from-[#121c33] to-[#0e182b] rounded-xl border border-emerald-500/30 flex items-center justify-between font-mono-numeric">
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">
                Toplam Yatırılan Tutar:
              </span>
              <span className="font-display font-extrabold text-lg text-emerald-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-sans">
              <span>{numericShares} Adet x {formatCurrency(numericPrice)}</span>
              {numericCommission > 0 && <span className="block text-slate-500">+ {formatCurrency(numericCommission)} komisyon</span>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Portföye Alış Olarak Ekle'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
