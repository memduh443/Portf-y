import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  BarChart3, 
  Target, 
  Zap, 
  PlusCircle, 
  Bookmark, 
  Check, 
  ArrowUpRight,
  Flame,
  Info,
  Clock,
  Briefcase
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MARKET_IDEAS } from '../data/initialData';
import { MarketIdea, MarketIdeaHorizon } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface MarketIdeasProps {
  onOpenBuyModal: (symbol?: string) => void;
}

export const MarketIdeas: React.FC<MarketIdeasProps> = ({ onOpenBuyModal }) => {
  const { addToWatchlist, watchlist } = usePortfolio();
  const [selectedHorizon, setSelectedHorizon] = useState<MarketIdeaHorizon | 'all'>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filteredIdeas = MARKET_IDEAS.filter(
    (idea) => selectedHorizon === 'all' || idea.horizon === selectedHorizon
  );

  const handleAddToWatch = async (idea: MarketIdea) => {
    await addToWatchlist({
      symbol: idea.symbol,
      name: idea.name,
      category: idea.category,
      price: idea.currentPrice,
      changePercent: idea.potentialPercent > 15 ? 2.4 : 1.2,
      support: idea.stopLoss,
      resistance: idea.targetPrice,
      sector: idea.criteria.sector,
    });

    setAddedIds((prev) => ({ ...prev, [idea.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [idea.id]: false }));
    }, 2000);
  };

  return (
    <div className="bg-[#101728] rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-[#101728] via-[#121f36] to-[#101728]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">
                Günün Dikkat Çeken Hisseleri & Piyasa Fikirleri
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Momentum, hacim, bilanço çarpanları ve teknik kırılımlarla puanlanmış analitik modeller
            </p>
          </div>

          {/* Horizon Category Tabs */}
          <div className="flex items-center bg-[#0a0f1d] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setSelectedHorizon('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedHorizon === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({MARKET_IDEAS.length})
            </button>
            <button
              onClick={() => setSelectedHorizon('short')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedHorizon === 'short'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              Kısa Vadeli
            </button>
            <button
              onClick={() => setSelectedHorizon('medium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedHorizon === 'medium'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              Orta Vadeli
            </button>
            <button
              onClick={() => setSelectedHorizon('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                selectedHorizon === 'watchlist'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              İzleme Listesi
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Yasal Uyarı:</strong> Burada yer alan hisse ve piyasa fikirleri kesin kazanç vaadi veya yatırım tavsiyesi (YTD) niteliğinde olmayıp, piyasa göstergeleri (momentum, hacim, çarpanlar) üzerinden bilgi ve simülasyon amaçlı derlenmiştir.
          </p>
        </div>
      </div>

      {/* Market Ideas Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const isWatched = watchlist.some((w) => w.symbol.toUpperCase() === idea.symbol.toUpperCase());
          const isJustAdded = addedIds[idea.id];

          return (
            <div
              key={idea.id}
              className="bg-[#0b101c] rounded-2xl border border-slate-800 hover:border-slate-700/80 p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/50 group"
            >
              <div>
                
                {/* Card Top: Symbol, Tag, Signal */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-lg text-white">
                        {idea.symbol}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {idea.horizon === 'short' ? 'KISA VADE' : idea.horizon === 'medium' ? 'ORTA VADE' : 'İZLEME'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium block truncate max-w-[200px]">
                      {idea.name}
                    </span>
                  </div>

                  {/* Signal Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide ${
                    idea.signal === 'GÜÇLÜ AL'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : idea.signal === 'KADEMELİ AL'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {idea.signal}
                  </span>
                </div>

                {/* Strategy Tag Pill */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {idea.tag}
                  </span>
                </div>

                {/* Price Targets & Potential Box */}
                <div className="grid grid-cols-3 gap-2 bg-[#080d17] p-2.5 rounded-xl border border-slate-800/80 mb-3 font-mono-numeric text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Mevcut Fiyat</span>
                    <span className="font-bold text-slate-200">{formatCurrency(idea.currentPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Hedef Fiyat</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(idea.targetPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Zarar Kes (Stop)</span>
                    <span className="font-medium text-rose-400">{formatCurrency(idea.stopLoss)}</span>
                  </div>
                </div>

                {/* Key Metrics / Criteria Breakdown */}
                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      Momentum Skoru:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono-numeric">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${idea.criteria.momentum}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-400">{idea.criteria.momentum}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Hacim Eğilimi:</span>
                    <span className="font-semibold text-slate-200">{idea.criteria.volumeTrend}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Temel Gösterge:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">{idea.criteria.fundamentals}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Sektör:</span>
                    <span className="text-slate-300 font-medium truncate max-w-[170px]">{idea.criteria.sector}</span>
                  </div>
                </div>

                {/* Analysis Commentary */}
                <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed mb-4">
                  {idea.analysisText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleAddToWatch(idea)}
                  disabled={isWatched}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    isWatched
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 cursor-default'
                      : isJustAdded
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isWatched ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>İzleniyor</span>
                    </>
                  ) : isJustAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Eklendi</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>İzlemeye Al</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenBuyModal(idea.symbol)}
                  className="flex-1 py-2 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Portföye Al</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
