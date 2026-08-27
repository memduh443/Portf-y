import React, { useState } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Wallet, 
  RefreshCw, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Layers,
  Sparkles,
  Smartphone,
  Cloud,
  CheckCircle2,
  Bell,
  BellRing
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  onOpenBuyModal: () => void;
  onOpenCashModal: () => void;
  onOpenAlertsModal: () => void;
  activeTab: 'dashboard' | 'assets' | 'transactions' | 'ideas' | 'watchlist';
  setActiveTab: (tab: 'dashboard' | 'assets' | 'transactions' | 'ideas' | 'watchlist') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBuyModal,
  onOpenCashModal,
  onOpenAlertsModal,
  activeTab,
  setActiveTab,
}) => {
  const { user, loginWithGoogle, logout, isSyncing, refreshAllPrices, summary, cashBalance, alerts } = usePortfolio();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuthInfo, setShowAuthInfo] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredAlertsCount = alerts.filter(a => a.triggered).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshAllPrices();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Real-time Market Ticker Ribbon */}
      <div className="bg-[#080c14] border-b border-slate-800/50 px-3 py-1.5 overflow-x-auto scrollbar-none text-xs font-mono-numeric">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 whitespace-nowrap min-w-max text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-300">PİYASA CANLI AKIŞ:</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">BIST 100:</span>
              <span className="text-slate-200 font-semibold">10.342,80</span>
              <span className="text-emerald-400 font-medium">+%1,42 ▲</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Gram Altın:</span>
              <span className="text-slate-200 font-semibold">3.420,00 ₺</span>
              <span className="text-emerald-400 font-medium">+%0,92 ▲</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">USD/TRY:</span>
              <span className="text-slate-200 font-semibold">36,45 ₺</span>
              <span className="text-slate-300 font-medium">+%0,12 ▲</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">EUR/TRY:</span>
              <span className="text-slate-200 font-semibold">38,20 ₺</span>
              <span className="text-slate-300 font-medium">+%0,18 ▲</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Bitcoin:</span>
              <span className="text-slate-200 font-semibold">3.340.500 ₺</span>
              <span className="text-emerald-400 font-medium">+%3,45 ▲</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            {user ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Firestore Bulut Senkronize ({user.email})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400/90">
                <Cloud className="w-3.5 h-3.5" />
                <span>Yerel Mod (Google ile bağla)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  PORTFÖY KOKPİTİ
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                BIST • Kripto • Fon • Döviz & Altın Takip Kokpiti
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121929] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Kokpit
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assets'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Varlıklarım ({summary.assetCount})
            </button>
            <button
              onClick={() => setActiveTab('ideas')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ideas'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Piyasa Fikirleri
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'watchlist'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              İzleme Listesi
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              İşlem Defteri
            </button>
          </nav>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Price Refresh Button */}
            <button
              onClick={handleRefresh}
              title="Piyasa Fiyatlarını Yenile"
              className="p-2 sm:px-3 sm:py-2 bg-slate-800/70 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Yenile</span>
            </button>

            {/* Price Alert Button with Badge */}
            <button
              onClick={onOpenAlertsModal}
              title="Fiyat Alarmları & Bildirimler"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                triggeredAlertsCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 ring-2 ring-amber-500/20'
                  : activeAlertsCount > 0
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                    : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 border-slate-700/50'
              }`}
            >
              <div className="relative">
                {triggeredAlertsCount > 0 ? (
                  <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-slate-300" />
                )}
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center">
                    {activeAlertsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Alarmlar</span>
            </button>

            {/* Deposit / Cash Management Button */}
            <button
              onClick={onOpenCashModal}
              title="Nakit Bakiye ve Para Yatırma"
              className="px-2.5 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nakit:</span>
              <span className="font-mono-numeric font-bold">{formatCurrency(cashBalance, 0)}</span>
            </button>

            {/* Primary HISSE / VARLIK AL Button */}
            <button
              onClick={onOpenBuyModal}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Hisse Al</span>
            </button>

            {/* Auth / Account Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="relative group">
                  <button 
                    onClick={logout}
                    title={`${user.email} (Çıkış yap)`}
                    className="flex items-center gap-2 p-1 bg-slate-800/90 rounded-full border border-slate-700 hover:border-rose-500/40 transition-colors"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="User" 
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                title="Google Hesabınızla Giriş Yaparak Verilerinizi Cihazlar Arası Senkronize Edin"
                className="px-2.5 sm:px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google ile Giriş</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto scrollbar-none py-2.5 gap-2 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            Kokpit
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'assets'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            Varlıklarım ({summary.assetCount})
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTab === 'ideas'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-amber-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Piyasa Fikirleri
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'watchlist'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            İzleme Listesi
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            İşlemler
          </button>
        </div>
      </div>
    </header>
  );
};
