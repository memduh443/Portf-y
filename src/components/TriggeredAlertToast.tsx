import React, { useEffect } from 'react';
import { 
  BellRing, 
  X, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Volume2,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../utils/formatters';

interface TriggeredAlertToastProps {
  onOpenAlertsModal: () => void;
}

export const TriggeredAlertToast: React.FC<TriggeredAlertToastProps> = ({
  onOpenAlertsModal,
}) => {
  const { latestTriggeredAlert, dismissLatestTriggeredAlert } = usePortfolio();

  // Auto-dismiss toast after 10 seconds if not interacted with
  useEffect(() => {
    if (!latestTriggeredAlert) return;
    const timer = setTimeout(() => {
      dismissLatestTriggeredAlert();
    }, 12000);
    return () => clearTimeout(timer);
  }, [latestTriggeredAlert, dismissLatestTriggeredAlert]);

  if (!latestTriggeredAlert) return null;

  const isAbove = latestTriggeredAlert.condition === 'ABOVE';
  const targetPriceFormatted = formatCurrency(latestTriggeredAlert.targetPrice);
  const currentPriceFormatted = formatCurrency(
    latestTriggeredAlert.triggeredPrice || latestTriggeredAlert.targetPrice
  );

  return (
    <div 
      id="triggered-alert-toast-banner" 
      className="fixed top-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full bg-[#111c30] border-2 border-amber-500/80 rounded-2xl shadow-2xl shadow-amber-500/20 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200 ring-4 ring-amber-500/10"
    >
      {/* Top Banner Alert Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-1.5 flex items-center justify-between text-slate-950 font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <BellRing className="w-3.5 h-3.5 animate-bounce" />
          <span>FİYAT ALARMI TETİKLENDİ!</span>
        </div>
        <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">
          CANLI BİLDİRİM
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl text-xs font-bold shrink-0 ${
              isAbove ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isAbove ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">
                  {latestTriggeredAlert.symbol}
                </h4>
                <span className="text-xs text-slate-400">
                  {latestTriggeredAlert.name}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1">
                Fiyat hedef seviyeniz olan <strong className="text-amber-400">{targetPriceFormatted}</strong>{' '}
                {isAbove ? 'üzerine çıktı (≥)' : 'altına indi (≤)'}.
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs font-mono-numeric">
                <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TETİKLENEN FİYAT</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {currentPriceFormatted}
                  </span>
                </div>

                <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">HEDEF SEVİYE</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {targetPriceFormatted}
                  </span>
                </div>
              </div>

              {latestTriggeredAlert.note && (
                <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/40 p-1.5 rounded border border-slate-800/60">
                  &ldquo;{latestTriggeredAlert.note}&rdquo;
                </div>
              )}
            </div>
          </div>

          <button
            onClick={dismissLatestTriggeredAlert}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              dismissLatestTriggeredAlert();
              onOpenAlertsModal();
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Alarmları Yönet
          </button>

          <button
            onClick={dismissLatestTriggeredAlert}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Bildirimi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
