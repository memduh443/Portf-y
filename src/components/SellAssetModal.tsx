import React, { useState, useEffect } from 'react';
import { 
  X, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Info, 
  AlertCircle 
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Asset } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const SellAssetModal: React.FC<SellAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { sellAsset } = usePortfolio();

  const [sharesToSell, setSharesToSell] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [commission, setCommission] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [addToCash, setAddToCash] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setSharesToSell(asset.shares.toString());
      setSellingPrice(asset.currentPrice.toString());
      setCommission('0');
      setNote('');
      setErrorMessage(null);
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const numericShares = parseFloat(sharesToSell) || 0;
  const numericPrice = parseFloat(sellingPrice) || 0;
  const numericCommission = parseFloat(commission) || 0;

  const grossTotal = numericShares * numericPrice;
  const netProceeds = grossTotal - numericCommission;
  const costBasis = numericShares * asset.avgBuyPrice;
  const realizedPnL = netProceeds - costBasis;
  const isProfit = realizedPnL >= 0;
  const pnlPercent = costBasis > 0 ? (realizedPnL / costBasis) * 100 : 0;

  const handleSellAll = () => {
    setSharesToSell(asset.shares.toString());
  };

  const handleSellHalf = () => {
    setSharesToSell((asset.shares / 2).toFixed(asset.shares % 1 === 0 ? 0 : 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numericShares <= 0) {
      setErrorMessage('Lütfen 0\'dan büyük bir satılacak adet giriniz.');
      return;
    }
    if (numericShares > asset.shares) {
      setErrorMessage(`En fazla elinizdeki adet (${asset.shares}) kadar satış yapabilirsiniz.`);
      return;
    }
    if (numericPrice <= 0) {
      setErrorMessage('Lütfen 0\'dan büyük bir satış fiyatı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sellAsset({
        assetId: asset.id,
        sharesToSell: numericShares,
        sellingPrice: numericPrice,
        commission: numericCommission,
        date,
        note: note.trim(),
        addToCash,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Satış kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101728] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#101728] to-[#25121b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Manuel Satış Kaydı ({asset.symbol})
              </h3>
              <p className="text-[11px] text-slate-400">
                Gerçekleşen kâr/zararı hesaplayıp işlem defterine işleyin
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs">
          
          {/* Position summary overview */}
          <div className="p-3.5 bg-[#0c121e] rounded-xl border border-slate-800 grid grid-cols-3 gap-2 font-mono-numeric">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Mevcut Adet</span>
              <span className="font-bold text-white text-sm">{asset.shares}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Ortalama Maliyet</span>
              <span className="font-medium text-slate-300">{formatCurrency(asset.avgBuyPrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Son Piyasa Fiyatı</span>
              <span className="font-bold text-emerald-400">{formatCurrency(asset.currentPrice)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Shares to sell with quick buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">
                Satılacak Adet / Lot <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSellHalf}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700"
                >
                  %50 Sat
                </button>
                <button
                  type="button"
                  onClick={handleSellAll}
                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-[10px] font-bold text-rose-300 border border-rose-500/30"
                >
                  Tümünü Sat
                </button>
              </div>
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              max={asset.shares}
              value={sharesToSell}
              onChange={(e) => setSharesToSell(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Birim Satış Fiyatı (TL) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold focus:outline-none focus:border-rose-500"
              required
            />
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
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Komisyon (TL)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric focus:outline-none focus:border-rose-500"
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
              placeholder="Örn: Hedef fiyata ulaşıldı, kâr realizasyonu yapıldı"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Cash add toggle */}
          <div className="p-3 bg-[#0c121e] rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addCash"
                checked={addToCash}
                onChange={(e) => setAddToCash(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="addCash" className="text-xs text-slate-300 cursor-pointer font-medium">
                Satıştan elde edilen net tutarı ({formatCurrency(netProceeds)}) nakit bakiyeme ekle
              </label>
            </div>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Realized PnL Calculation Highlight Box */}
          <div className={`p-4 rounded-xl border font-mono-numeric ${
            isProfit 
              ? 'bg-gradient-to-r from-[#0f2820] to-[#0c1b18] border-emerald-500/40 text-emerald-300' 
              : 'bg-gradient-to-r from-[#2c1218] to-[#1e0e13] border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 text-xs font-sans font-semibold flex items-center gap-1.5">
                {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                Gerçekleşen Net Kâr / Zarar:
              </span>
              <span className="font-display font-black text-lg">
                {isProfit ? '+' : ''}{formatCurrency(realizedPnL)} ({formatPercent(pnlPercent)})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between pt-1.5 border-t border-slate-700/50">
              <span>Toplam Tahsilat: {formatCurrency(netProceeds)}</span>
              <span>Maliyet: {formatCurrency(costBasis)}</span>
            </div>
          </div>

          {/* Submit */}
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
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Satış Kaydediliyor...' : 'Satışı Kaydet ve Bitir'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
