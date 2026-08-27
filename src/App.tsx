import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PerformanceChart } from './components/PerformanceChart';
import { AssetDistribution } from './components/AssetDistribution';
import { AssetTable } from './components/AssetTable';
import { BuyAssetModal } from './components/BuyAssetModal';
import { SellAssetModal } from './components/SellAssetModal';
import { CashModal } from './components/CashModal';
import { AssetEditModal } from './components/AssetEditModal';
import { PriceUpdateModal } from './components/PriceUpdateModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { TriggeredAlertToast } from './components/TriggeredAlertToast';
import { TransactionHistory } from './components/TransactionHistory';
import { MarketIdeas } from './components/MarketIdeas';
import { WatchlistSection } from './components/WatchlistSection';
import { RecentTransactionsCard } from './components/RecentTransactionsCard';
import { Asset, AssetCategory } from './types';
import { 
  TrendingUp, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  Wallet,
  Smartphone,
  Cloud,
  CheckCircle2,
  Bookmark,
  BellRing
} from 'lucide-react';

function DashboardContent() {
  const { resetToSampleData, user, isSyncing, alerts } = usePortfolio();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'transactions' | 'ideas' | 'watchlist'>('dashboard');

  // Modal states
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyPrefillSymbol, setBuyPrefillSymbol] = useState<string | undefined>(undefined);
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedSellAsset, setSelectedSellAsset] = useState<Asset | null>(null);

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditAsset, setSelectedEditAsset] = useState<Asset | null>(null);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPriceAsset, setSelectedPriceAsset] = useState<Asset | null>(null);

  // Price Alert Modal state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertAsset, setSelectedAlertAsset] = useState<{
    symbol: string;
    name: string;
    category: AssetCategory;
    currentPrice: number;
  } | null>(null);

  // Modal Triggers
  const handleOpenBuyModal = (symbol?: string) => {
    setBuyPrefillSymbol(symbol);
    setIsBuyModalOpen(true);
  };

  const handleOpenSellModal = (asset: Asset) => {
    setSelectedSellAsset(asset);
    setIsSellModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setSelectedEditAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleOpenPriceModal = (asset: Asset) => {
    setSelectedPriceAsset(asset);
    setIsPriceModalOpen(true);
  };

  const handleOpenAlertModal = (asset?: {
    symbol: string;
    name: string;
    category: AssetCategory;
    currentPrice: number;
  }) => {
    setSelectedAlertAsset(asset || null);
    setIsAlertModalOpen(true);
  };

  const handleReset = async () => {
    const confirm = window.confirm(
      'Örnek portföy verilerine (ASELS, ASTOR, BIMAS, CANTE, ENKA, KCHOL, TCELL) sıfırlamak istiyor musunuz?'
    );
    if (confirm) {
      await resetToSampleData();
    }
  };

  const activeAlertsCount = alerts.filter(a => a.active && !a.triggered).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Live Alert Toast Banner */}
      <TriggeredAlertToast onOpenAlertsModal={() => handleOpenAlertModal()} />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBuyModal={() => handleOpenBuyModal()}
        onOpenCashModal={() => setIsCashModalOpen(true)}
        onOpenAlertsModal={() => handleOpenAlertModal()}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        
        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* 1. TOP STATS CARDS */}
            <SummaryCards />

            {/* 2. CHARTS SECTION (Performance Area + Asset Donut) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <div className="lg:col-span-1">
                <AssetDistribution />
              </div>
            </div>

            {/* 3. PORTFOLIO ASSETS TABLE */}
            <AssetTable
              onOpenBuyModal={handleOpenBuyModal}
              onOpenSellModal={handleOpenSellModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenPriceModal={handleOpenPriceModal}
              onOpenAlertModal={handleOpenAlertModal}
            />

            {/* 4. MARKET IDEAS & RECENT TRANSACTIONS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <MarketIdeas onOpenBuyModal={handleOpenBuyModal} />
              </div>
              <div className="xl:col-span-1 space-y-5">
                <RecentTransactionsCard onViewAll={() => setActiveTab('transactions')} />
                
                {/* Price Alerts Quick Status Card */}
                <div className="bg-[#101728] p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-white text-sm">Fiyat Alarmları</h4>
                        {activeAlertsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            {activeAlertsCount} Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Hedef fiyat anlık bildirimleri</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAlertModal()}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors border border-amber-500/30"
                  >
                    Alarmları Aç
                  </button>
                </div>

                {/* Watchlist Quick Peek Card */}
                <div className="bg-[#101728] p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-sm">İzleme Listesi</h4>
                      <p className="text-xs text-slate-400">Takip ettiğiniz favori hisseler</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('watchlist')}
                    className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold rounded-xl text-xs transition-colors border border-cyan-500/30"
                  >
                    Listeyi Aç
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SummaryCards />
            <AssetTable
              onOpenBuyModal={handleOpenBuyModal}
              onOpenSellModal={handleOpenSellModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenPriceModal={handleOpenPriceModal}
              onOpenAlertModal={handleOpenAlertModal}
            />
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <MarketIdeas onOpenBuyModal={handleOpenBuyModal} />
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <WatchlistSection 
              onOpenBuyModal={handleOpenBuyModal}
              onOpenAlertModal={handleOpenAlertModal}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <TransactionHistory />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b13] py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ₺
            </div>
            <span className="font-display font-bold text-slate-200">
              PORTFÖY KOKPİTİ
            </span>
            <span className="text-slate-500">• BIST, Kripto, Altın & Fon Takibi</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Örnek Portföyü Yeniden Yükle</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">
              {user ? 'Bulut Senkronizasyonu Aktif' : 'Yerel Hafıza Modu'}
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <BuyAssetModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        prefillSymbol={buyPrefillSymbol}
      />

      <SellAssetModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedSellAsset(null);
        }}
        asset={selectedSellAsset}
      />

      <CashModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
      />

      <AssetEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditAsset(null);
        }}
        asset={selectedEditAsset}
      />

      <PriceUpdateModal
        isOpen={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setSelectedPriceAsset(null);
        }}
        asset={selectedPriceAsset}
      />

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setSelectedAlertAsset(null);
        }}
        preSelectedAsset={selectedAlertAsset}
      />

    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <DashboardContent />
    </PortfolioProvider>
  );
}
