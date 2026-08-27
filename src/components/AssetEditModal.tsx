import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Asset, AssetCategory } from '../types';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const AssetEditModal: React.FC<AssetEditModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { updateAsset } = usePortfolio();

  const [shares, setShares] = useState<string>('');
  const [avgBuyPrice, setAvgBuyPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [category, setCategory] = useState<AssetCategory>('bist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setShares(asset.shares.toString());
      setAvgBuyPrice(asset.avgBuyPrice.toString());
      setCurrentPrice(asset.currentPrice.toString());
      setName(asset.name);
      setNotes(asset.notes || '');
      setCategory(asset.category);
      setError(null);
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numShares = parseFloat(shares);
    const numAvgPrice = parseFloat(avgBuyPrice);
    const numCurrentPrice = parseFloat(currentPrice);

    if (isNaN(numShares) || numShares <= 0) {
      setError('Geçerli bir adet giriniz.');
      return;
    }
    if (isNaN(numAvgPrice) || numAvgPrice <= 0) {
      setError('Geçerli bir ortalama alış fiyatı giriniz.');
      return;
    }
    if (isNaN(numCurrentPrice) || numCurrentPrice <= 0) {
      setError('Geçerli bir güncel fiyat giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAsset(asset.id, {
        name: name.trim() || asset.symbol,
        shares: numShares,
        avgBuyPrice: numAvgPrice,
        currentPrice: numCurrentPrice,
        category,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Güncelleme sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101728] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#101728] to-[#16233b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Pozisyonu Düzenle ({asset.symbol})
              </h3>
              <p className="text-[11px] text-slate-400">
                Adet, maliyet ve kayıt detaylarını manuel güncelleyin
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 font-sans text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Şirket / Varlık Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mevcut Adet / Lot</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ortalama Alış (TL)</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Güncel Fiyat (TL)</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold text-emerald-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Özel Not / Strateji</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white resize-none"
              placeholder="Pozisyon hedefi, temettü beklentisi..."
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
