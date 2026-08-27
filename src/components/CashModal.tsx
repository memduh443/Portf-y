import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Info,
  Check
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../utils/formatters';

interface CashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashModal: React.FC<CashModalProps> = ({ isOpen, onClose }) => {
  const { cashBalance, depositCash, withdrawCash } = usePortfolio();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount) || 0;

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numericAmount <= 0) {
      setError('Lütfen 0\'dan büyük bir tutar giriniz.');
      return;
    }

    if (mode === 'withdraw' && numericAmount > cashBalance) {
      setError(`Çekmek istediğiniz tutar mevcut nakit bakiyenizden (${formatCurrency(cashBalance)}) fazladır.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'deposit') {
        await depositCash(numericAmount, date, note || 'Yatırım Hesabına Nakit Girişi');
      } else {
        await withdrawCash(numericAmount, date, note || 'Yatırım Hesabından Nakit Çıkışı');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'İşlem sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101728] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#101728] to-[#1a233a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Nakit Bakiye & Yatırılan Para
              </h3>
              <p className="text-[11px] text-slate-400">
                Alım için ayırdığınız hazır nakit sermayeyi yönetin
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 font-sans text-xs">
          
          {/* Current Balance Banner */}
          <div className="p-3.5 bg-[#0c121e] rounded-xl border border-slate-800 flex items-center justify-between font-mono-numeric">
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">
                Mevcut Hazır Nakit Bakiye:
              </span>
              <span className="font-display font-extrabold text-xl text-amber-300">
                {formatCurrency(cashBalance)}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
              Kullanılabilir
            </div>
          </div>

          {/* Tab Selector: Para Yatır vs Para Çek */}
          <div className="grid grid-cols-2 gap-2 bg-[#0c121e] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                mode === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Para Yatır / Ekle</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                mode === 'withdraw'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Para Çek / Düş</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {mode === 'deposit' ? 'Yatırılacak Tutar (TL)' : 'Çekilecek Tutar (TL)'}{' '}
              <span className="text-emerald-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="Örn: 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0c121e] border border-slate-700 rounded-xl text-white font-mono-numeric font-bold text-base focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Quick preset amount chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-[11px] font-mono-numeric font-semibold transition-all"
              >
                +{formatCurrency(q, 0)}
              </button>
            ))}
          </div>

          {/* Date & Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">İşlem Tarihi</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Açıklama / Not</label>
            <input
              type="text"
              placeholder={mode === 'deposit' ? 'Maaş / Ek bütçe aktarımı' : 'Nakit ihtiyaç çekimi'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121e] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
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
              className={`flex-1 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
                mode === 'deposit'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : mode === 'deposit' ? 'Nakit Girişini Kaydet' : 'Nakit Çıkışını Kaydet'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
