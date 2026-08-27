import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Asset } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { updateAssetPrice } = usePortfolio();
  const [newPrice, setNewPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset) {
      setNewPrice(asset.currentPrice.toString());
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const numPrice = parseFloat(newPrice) || 0;
  const diffPct = asset.currentPrice > 0 
    ? ((numPrice - asset.currentPrice) / asset.currentPrice) * 100 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numPrice <= 0) return;

    setIsSubmitting(true);
    try {
      await updateAssetPrice(asset.id, numPrice);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101728] border border-slate-700/80 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-white text-base">
              Fiyat Güncelle ({asset.symbol})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs font-sans">
          <div className="p-3 bg-[#0c121e] rounded-xl border border-slate-800 flex items-center justify-between font-mono-numeric">
            <span className="text-slate-400 font-sans">Mevcut Kayıtlı Fiyat:</span>
            <span className="font-bold text-white text-sm">{formatCurrency(asset.currentPrice)}</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Yeni Güncel Fiyat (TL)
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold text-base focus:outline-none focus:border-emerald-500"
              required
              autoFocus
            />
          </div>

          {numPrice > 0 && numPrice !== asset.currentPrice && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono-numeric">
              <span className="text-slate-400 font-sans">Değişim Farkı:</span>
              <span className={`font-bold flex items-center gap-1 ${diffPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diffPct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {formatPercent(diffPct)}
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Fiyatı Güncelle'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
