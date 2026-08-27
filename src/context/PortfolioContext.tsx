import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { 
  Asset, 
  Transaction, 
  WatchlistItem, 
  PortfolioSummary, 
  CategoryDistribution, 
  AssetCategory,
  PriceAlert,
  AlertCondition
} from '../types';
import { 
  INITIAL_ASSETS, 
  INITIAL_CASH_BALANCE, 
  INITIAL_TRANSACTIONS, 
  INITIAL_WATCHLIST,
  INITIAL_ALERTS
} from '../data/initialData';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logoutUser, 
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType
} from '../firebase/firebase';
import { User } from 'firebase/auth';
import { 
  sendBrowserNotification, 
  playNotificationSound, 
  requestNotificationPermission, 
  getNotificationPermissionStatus 
} from '../utils/alertNotifier';

interface PortfolioContextType {
  user: User | null;
  authLoading: boolean;
  isSyncing: boolean;
  assets: Asset[];
  transactions: Transaction[];
  watchlist: WatchlistItem[];
  cashBalance: number;
  summary: PortfolioSummary;
  categoryDistribution: CategoryDistribution[];
  
  // Price Alerts
  alerts: PriceAlert[];
  latestTriggeredAlert: PriceAlert | null;
  notificationPermission: NotificationPermission;
  addAlert: (data: {
    symbol: string;
    name: string;
    category: AssetCategory;
    targetPrice: number;
    condition: AlertCondition;
    initialPrice: number;
    note?: string;
  }) => Promise<void>;
  updateAlert: (alertId: string, updates: Partial<PriceAlert>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  toggleAlertActive: (alertId: string) => Promise<void>;
  rearmAlert: (alertId: string, newTargetPrice?: number) => Promise<void>;
  dismissLatestTriggeredAlert: () => void;
  testAlertNotification: (customSymbol?: string) => void;
  requestBrowserPermission: () => Promise<NotificationPermission>;

  // Actions
  buyAsset: (data: {
    symbol: string;
    name: string;
    category: AssetCategory;
    shares: number;
    price: number;
    date: string;
    commission?: number;
    note?: string;
    deductFromCash?: boolean;
  }) => Promise<void>;
  
  sellAsset: (data: {
    assetId: string;
    sharesToSell: number;
    sellingPrice: number;
    date: string;
    commission?: number;
    note?: string;
    addToCash?: boolean;
  }) => Promise<void>;
  
  depositCash: (amount: number, date: string, note?: string) => Promise<void>;
  withdrawCash: (amount: number, date: string, note?: string) => Promise<void>;
  
  updateAsset: (assetId: string, updates: Partial<Asset>) => Promise<void>;
  updateAssetPrice: (assetId: string, newPrice: number, changePercent?: number) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  
  addToWatchlist: (item: Omit<WatchlistItem, 'id'>) => Promise<void>;
  removeFromWatchlist: (itemId: string) => Promise<void>;
  
  refreshAllPrices: () => void;
  resetToSampleData: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'PORTFOY_KOKPITI_DATA_V1';

const CATEGORY_META: Record<AssetCategory, { name: string; color: string }> = {
  bist: { name: 'BIST Hisse', color: '#10b981' },        // emerald
  crypto: { name: 'Kripto Para', color: '#8b5cf6' },    // purple
  gold: { name: 'Altın & Emtia', color: '#f59e0b' },     // amber/gold
  fund: { name: 'TEFAS Fon / ETF', color: '#06b6d4' },   // cyan
  fx: { name: 'Döviz', color: '#3b82f6' },              // blue
  cash: { name: 'Nakit Bakiye', color: '#64748b' },      // slate
};

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core state
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assets`);
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_txs`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_watch`);
      return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
    } catch {
      return INITIAL_WATCHLIST;
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_cash`);
      return saved ? Number(saved) : INITIAL_CASH_BALANCE;
    } catch {
      return INITIAL_CASH_BALANCE;
    }
  });

  // Price Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [latestTriggeredAlert, setLatestTriggeredAlert] = useState<PriceAlert | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => 
    getNotificationPermissionStatus()
  );

  // Keep a ref to latest alerts for checking price hits without stale closures
  const alertsRef = useRef<PriceAlert[]>(alerts);
  alertsRef.current = alerts;

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_watch`, JSON.stringify(watchlist));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_cash`, cashBalance.toString());
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    } catch (err) {
      console.warn('LocalStorage save error', err);
    }
  }, [assets, transactions, watchlist, cashBalance, alerts]);

  // Test connection on boot as required by firebase skill
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Firebase Auth & Firestore Listener
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        setIsSyncing(true);
        const userDocPath = `users/${currentUser.uid}`;
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.assets) setAssets(data.assets);
            if (data.transactions) setTransactions(data.transactions);
            if (data.watchlist) setWatchlist(data.watchlist);
            if (typeof data.cashBalance === 'number') setCashBalance(data.cashBalance);
            if (data.alerts) setAlerts(data.alerts);
          } else {
            // First time login: seed current state to Firestore
            await setDoc(userDocRef, {
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              assets,
              transactions,
              watchlist,
              cashBalance,
              alerts,
              updatedAt: Date.now(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, userDocPath);
        } finally {
          setIsSyncing(false);
        }

        // Setup real-time listener for multi-device sync
        try {
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.assets) setAssets(data.assets);
                if (data.transactions) setTransactions(data.transactions);
                if (data.watchlist) setWatchlist(data.watchlist);
                if (typeof data.cashBalance === 'number') setCashBalance(data.cashBalance);
                if (data.alerts) setAlerts(data.alerts);
              }
            },
            (error) => {
              handleFirestoreError(error, OperationType.GET, userDocPath);
            }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, userDocPath);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Helper to persist to Firestore if logged in
  const syncToFirestore = async (
    newAssets?: Asset[], 
    newTxs?: Transaction[], 
    newWatch?: WatchlistItem[], 
    newCash?: number,
    newAlerts?: PriceAlert[]
  ) => {
    if (!user) return;
    const userDocPath = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const payload: any = {
        updatedAt: Date.now(),
      };
      if (newAssets !== undefined) payload.assets = newAssets;
      if (newTxs !== undefined) payload.transactions = newTxs;
      if (newWatch !== undefined) payload.watchlist = newWatch;
      if (newCash !== undefined) payload.cashBalance = newCash;
      if (newAlerts !== undefined) payload.alerts = newAlerts;

      await setDoc(userDocRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userDocPath);
    }
  };

  // CHECK PRICE ALERTS ENGINE
  const evaluateAlertsAgainstPrices = (currentAssetsList: Asset[], currentWatchlist: WatchlistItem[] = []) => {
    const currentAlerts = alertsRef.current;
    let anyTriggered = false;
    let newlyTriggeredOne: PriceAlert | null = null;

    const evaluatedAlerts = currentAlerts.map((alert) => {
      if (!alert.active || alert.triggered) {
        return alert;
      }

      // Check in assets list first
      const assetMatch = currentAssetsList.find(
        (a) => a.symbol.toUpperCase() === alert.symbol.toUpperCase()
      );
      // If not in assets, check in watchlist
      const watchMatch = !assetMatch 
        ? currentWatchlist.find((w) => w.symbol.toUpperCase() === alert.symbol.toUpperCase()) 
        : null;

      const currentPrice = assetMatch ? assetMatch.currentPrice : watchMatch ? watchMatch.price : null;

      if (currentPrice === null) return alert;

      let hit = false;
      if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
        hit = true;
      } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
        hit = true;
      }

      if (hit) {
        anyTriggered = true;
        const triggeredAlert: PriceAlert = {
          ...alert,
          triggered: true,
          triggeredAt: Date.now(),
          triggeredPrice: currentPrice,
        };

        newlyTriggeredOne = triggeredAlert;

        const conditionLabel = alert.condition === 'ABOVE' ? 'hedefinin üzerine çıktı' : 'hedefinin altına indi';
        const formattedPrice = `₺${currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedTarget = `₺${alert.targetPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const title = `🚨 FİYAT ALARMI: ${alert.symbol}`;
        const body = `${alert.symbol} (${alert.name}) güncel fiyatı ${formattedPrice} ile ${formattedTarget} ${conditionLabel}!`;

        sendBrowserNotification(title, body);
        return triggeredAlert;
      }

      return alert;
    });

    if (anyTriggered) {
      setAlerts(evaluatedAlerts);
      if (newlyTriggeredOne) {
        setLatestTriggeredAlert(newlyTriggeredOne);
      }
      syncToFirestore(undefined, undefined, undefined, undefined, evaluatedAlerts);
    }
  };

  // Run alert check whenever assets or watchlist change
  useEffect(() => {
    evaluateAlertsAgainstPrices(assets, watchlist);
  }, [assets, watchlist]);

  // PRICE ALERT ACTIONS
  const addAlert = async (data: {
    symbol: string;
    name: string;
    category: AssetCategory;
    targetPrice: number;
    condition: AlertCondition;
    initialPrice: number;
    note?: string;
  }) => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      symbol: data.symbol.trim().toUpperCase(),
      name: data.name.trim() || data.symbol.trim().toUpperCase(),
      category: data.category,
      targetPrice: data.targetPrice,
      condition: data.condition,
      initialPrice: data.initialPrice,
      triggered: false,
      createdAt: Date.now(),
      active: true,
      note: data.note?.trim() || undefined,
    };

    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    await syncToFirestore(undefined, undefined, undefined, undefined, updated);

    // Immediately test if it matches current price
    evaluateAlertsAgainstPrices(assets, watchlist);
  };

  const updateAlert = async (alertId: string, updates: Partial<PriceAlert>) => {
    const updated = alerts.map((al) => (al.id === alertId ? { ...al, ...updates } : al));
    setAlerts(updated);
    await syncToFirestore(undefined, undefined, undefined, undefined, updated);
  };

  const deleteAlert = async (alertId: string) => {
    const updated = alerts.filter((al) => al.id !== alertId);
    setAlerts(updated);
    await syncToFirestore(undefined, undefined, undefined, undefined, updated);
  };

  const toggleAlertActive = async (alertId: string) => {
    const updated = alerts.map((al) => 
      al.id === alertId ? { ...al, active: !al.active } : al
    );
    setAlerts(updated);
    await syncToFirestore(undefined, undefined, undefined, undefined, updated);
  };

  const rearmAlert = async (alertId: string, newTargetPrice?: number) => {
    const targetAlert = alerts.find(a => a.id === alertId);
    const assetMatch = targetAlert ? assets.find(a => a.symbol.toUpperCase() === targetAlert.symbol.toUpperCase()) : null;
    const currentPrice = assetMatch ? assetMatch.currentPrice : (targetAlert?.initialPrice || 0);

    const updated = alerts.map((al) => {
      if (al.id === alertId) {
        return {
          ...al,
          triggered: false,
          triggeredAt: undefined,
          triggeredPrice: undefined,
          active: true,
          initialPrice: currentPrice,
          targetPrice: newTargetPrice !== undefined ? newTargetPrice : al.targetPrice,
        };
      }
      return al;
    });

    setAlerts(updated);
    await syncToFirestore(undefined, undefined, undefined, undefined, updated);
  };

  const dismissLatestTriggeredAlert = () => {
    setLatestTriggeredAlert(null);
  };

  const testAlertNotification = (customSymbol?: string) => {
    playNotificationSound();
    const symbol = customSymbol || 'ASELS';
    const sampleAlert: PriceAlert = {
      id: `test-${Date.now()}`,
      symbol,
      name: 'Örnek Alarm Testi',
      category: 'bist',
      targetPrice: 425.00,
      condition: 'ABOVE',
      initialPrice: 418.50,
      triggered: true,
      triggeredAt: Date.now(),
      triggeredPrice: 425.50,
      createdAt: Date.now(),
      active: true,
      note: 'Tarayıcı ve sesli uyarı sistemi test bildirimi'
    };

    setLatestTriggeredAlert(sampleAlert);
    sendBrowserNotification(
      `🔔 TEST: ${symbol} Hedef Fiyata Ulaştı!`,
      `Fiyat alarm sistemi başarıyla çalışıyor. ₺425,50 seviyesi tespit edildi.`
    );
  };

  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    return perm;
  };


  // BUY ASSET
  const buyAsset = async ({
    symbol,
    name,
    category,
    shares,
    price,
    date,
    commission = 0,
    note = '',
    deductFromCash = false,
  }: {
    symbol: string;
    name: string;
    category: AssetCategory;
    shares: number;
    price: number;
    date: string;
    commission?: number;
    note?: string;
    deductFromCash?: boolean;
  }) => {
    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanName = name.trim() || cleanSymbol;
    const totalCost = shares * price + commission;

    // Check if asset already exists in portfolio
    const existingIndex = assets.findIndex(
      (a) => a.symbol.toUpperCase() === cleanSymbol && a.category === category
    );

    let updatedAssets: Asset[];
    let targetAssetId = '';

    if (existingIndex >= 0) {
      const existing = assets[existingIndex];
      targetAssetId = existing.id;
      const totalOldShares = existing.shares;
      const totalNewShares = totalOldShares + shares;
      // Weighted average cost formula
      const newAvgBuyPrice = totalNewShares > 0 
        ? ((totalOldShares * existing.avgBuyPrice) + (shares * price)) / totalNewShares 
        : price;

      const updatedAsset: Asset = {
        ...existing,
        shares: totalNewShares,
        avgBuyPrice: Number(newAvgBuyPrice.toFixed(4)),
        currentPrice: price, // latest price
        updatedAt: Date.now(),
      };

      updatedAssets = [...assets];
      updatedAssets[existingIndex] = updatedAsset;
    } else {
      targetAssetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newAsset: Asset = {
        id: targetAssetId,
        symbol: cleanSymbol,
        name: cleanName,
        category,
        shares,
        avgBuyPrice: price,
        currentPrice: price,
        dailyChangePercent: 0,
        notes: note,
        updatedAt: Date.now(),
      };
      updatedAssets = [newAsset, ...assets];
    }

    // New transaction record
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      assetId: targetAssetId,
      symbol: cleanSymbol,
      name: cleanName,
      type: 'buy',
      category,
      shares,
      price,
      totalAmount: totalCost,
      commission,
      date,
      note,
      createdAt: Date.now(),
    };

    const updatedTxs = [newTx, ...transactions];
    let updatedCash = cashBalance;

    if (deductFromCash) {
      updatedCash = Math.max(0, cashBalance - totalCost);
    }

    setAssets(updatedAssets);
    setTransactions(updatedTxs);
    setCashBalance(updatedCash);

    await syncToFirestore(updatedAssets, updatedTxs, undefined, updatedCash);
  };

  // SELL ASSET
  const sellAsset = async ({
    assetId,
    sharesToSell,
    sellingPrice,
    date,
    commission = 0,
    note = '',
    addToCash = false,
  }: {
    assetId: string;
    sharesToSell: number;
    sellingPrice: number;
    date: string;
    commission?: number;
    note?: string;
    addToCash?: boolean;
  }) => {
    const existingIndex = assets.findIndex((a) => a.id === assetId);
    if (existingIndex < 0) return;

    const existing = assets[existingIndex];
    const actualSharesToSell = Math.min(existing.shares, sharesToSell);
    const grossTotal = actualSharesToSell * sellingPrice;
    const netProceeds = grossTotal - commission;

    // Realized Profit/Loss = Net proceeds - (shares sold * avg buy price)
    const costBasis = actualSharesToSell * existing.avgBuyPrice;
    const realizedPnL = netProceeds - costBasis;

    let updatedAssets: Asset[];
    const remainingShares = existing.shares - actualSharesToSell;

    if (remainingShares <= 0.0001) {
      // Remove completely if all shares sold
      updatedAssets = assets.filter((a) => a.id !== assetId);
    } else {
      updatedAssets = [...assets];
      updatedAssets[existingIndex] = {
        ...existing,
        shares: remainingShares,
        currentPrice: sellingPrice,
        updatedAt: Date.now(),
      };
    }

    const newTx: Transaction = {
      id: `tx-sell-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      assetId,
      symbol: existing.symbol,
      name: existing.name,
      type: 'sell',
      category: existing.category,
      shares: actualSharesToSell,
      price: sellingPrice,
      totalAmount: netProceeds,
      commission,
      realizedPnL: Number(realizedPnL.toFixed(2)),
      date,
      note,
      createdAt: Date.now(),
    };

    const updatedTxs = [newTx, ...transactions];
    let updatedCash = cashBalance;
    if (addToCash) {
      updatedCash = cashBalance + netProceeds;
    }

    setAssets(updatedAssets);
    setTransactions(updatedTxs);
    setCashBalance(updatedCash);

    await syncToFirestore(updatedAssets, updatedTxs, undefined, updatedCash);
  };

  // DEPOSIT CASH
  const depositCash = async (amount: number, date: string, note = 'Hesaba Para Yatırma') => {
    if (amount <= 0) return;
    const newCash = cashBalance + amount;
    const newTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      symbol: 'NAKIT',
      name: 'Nakit Fon Girişi',
      type: 'deposit',
      category: 'cash',
      shares: 1,
      price: amount,
      totalAmount: amount,
      commission: 0,
      date,
      note,
      createdAt: Date.now(),
    };
    const updatedTxs = [newTx, ...transactions];
    setCashBalance(newCash);
    setTransactions(updatedTxs);
    await syncToFirestore(undefined, updatedTxs, undefined, newCash);
  };

  // WITHDRAW CASH
  const withdrawCash = async (amount: number, date: string, note = 'Hesaptan Para Çekme') => {
    if (amount <= 0) return;
    const newCash = Math.max(0, cashBalance - amount);
    const newTx: Transaction = {
      id: `tx-with-${Date.now()}`,
      symbol: 'NAKIT',
      name: 'Nakit Fon Çıkışı',
      type: 'withdraw',
      category: 'cash',
      shares: 1,
      price: amount,
      totalAmount: amount,
      commission: 0,
      date,
      note,
      createdAt: Date.now(),
    };
    const updatedTxs = [newTx, ...transactions];
    setCashBalance(newCash);
    setTransactions(updatedTxs);
    await syncToFirestore(undefined, updatedTxs, undefined, newCash);
  };

  // UPDATE ASSET
  const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
    const updatedAssets = assets.map((a) => {
      if (a.id === assetId) {
        return { ...a, ...updates, updatedAt: Date.now() };
      }
      return a;
    });
    setAssets(updatedAssets);
    await syncToFirestore(updatedAssets);
  };

  // UPDATE ASSET PRICE
  const updateAssetPrice = async (assetId: string, newPrice: number, changePercent?: number) => {
    const updatedAssets = assets.map((a) => {
      if (a.id === assetId) {
        const oldPrice = a.currentPrice;
        const diffPct = changePercent !== undefined 
          ? changePercent 
          : oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
        return {
          ...a,
          currentPrice: newPrice,
          dailyChangePercent: Number(diffPct.toFixed(2)),
          updatedAt: Date.now(),
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    await syncToFirestore(updatedAssets);
  };

  // DELETE ASSET
  const deleteAsset = async (assetId: string) => {
    const updatedAssets = assets.filter((a) => a.id !== assetId);
    setAssets(updatedAssets);
    await syncToFirestore(updatedAssets);
  };

  // WATCHLIST ACTIONS
  const addToWatchlist = async (item: Omit<WatchlistItem, 'id'>) => {
    if (watchlist.some((w) => w.symbol.toUpperCase() === item.symbol.toUpperCase())) {
      return;
    }
    const newItem: WatchlistItem = {
      ...item,
      id: `watch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newItem, ...watchlist];
    setWatchlist(updated);
    await syncToFirestore(undefined, undefined, updated);
  };

  const removeFromWatchlist = async (itemId: string) => {
    const updated = watchlist.filter((w) => w.id !== itemId);
    setWatchlist(updated);
    await syncToFirestore(undefined, undefined, updated);
  };

  // LIVE SIMULATED PRICE FLICKER / REFRESH
  const refreshAllPrices = async () => {

  try {

    const response = await fetch('/api/market-prices', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        assets: assets.map((a) => ({

          id: a.id,

          symbol: a.symbol,

          category: a.category,

        })),

        watchlist: watchlist.map((w) => ({

          id: w.id,

          symbol: w.symbol,

          category: w.category,

        })),

      }),

    });

    if (!response.ok) {

      throw new Error(`Fiyat servisi hatası: ${response.status}`);

    }

    const data = await response.json();

    const prices = data.prices || {};

    const updatedAssets = assets.map((asset) => {

      const quote = prices[asset.symbol.toUpperCase()];

      if (!quote || typeof quote.price !== 'number') {

        return asset;

      }

      return {

        ...asset,

        currentPrice: Number(quote.price.toFixed(4)),

        dailyChangePercent:

          typeof quote.changePercent === 'number'

            ? Number(quote.changePercent.toFixed(2))

            : asset.dailyChangePercent,

        updatedAt: Date.now(),

      };

    });

    const updatedWatchlist = watchlist.map((item) => {

      const quote = prices[item.symbol.toUpperCase()];

      if (!quote || typeof quote.price !== 'number') {

        return item;

      }

      return {

        ...item,

        price: Number(quote.price.toFixed(4)),

        changePercent:

          typeof quote.changePercent === 'number'

            ? Number(quote.changePercent.toFixed(2))

            : item.changePercent,

        updatedAt: Date.now(),

      };

    });

    setAssets(updatedAssets);

    setWatchlist(updatedWatchlist);

    await syncToFirestore(

      updatedAssets,

      undefined,

      updatedWatchlist

    );

  } catch (error) {

    console.error('Canlı fiyat güncelleme hatası:', error);

  }

};
    // RESET TO DEFAULT
  const resetToSampleData = async () => {
    setAssets(INITIAL_ASSETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setWatchlist(INITIAL_WATCHLIST);
    setCashBalance(INITIAL_CASH_BALANCE);
    await syncToFirestore(INITIAL_ASSETS, INITIAL_TRANSACTIONS, INITIAL_WATCHLIST, INITIAL_CASH_BALANCE);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Summary Calculations
  const summary: PortfolioSummary = useMemo(() => {
    let totalAssetsValue = 0;
    let totalInvested = 0;
    let dailyProfitLoss = 0;

    assets.forEach((asset) => {
      const assetValue = asset.shares * asset.currentPrice;
      const assetCost = asset.shares * asset.avgBuyPrice;
      totalAssetsValue += assetValue;
      totalInvested += assetCost;

      // Daily P&L for this asset
      const dailyDelta = (assetValue * (asset.dailyChangePercent / 100)) / (1 + asset.dailyChangePercent / 100);
      dailyProfitLoss += dailyDelta;
    });

    const totalPortfolioValue = totalAssetsValue + cashBalance;
    const totalProfitLoss = totalAssetsValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 
      ? (totalProfitLoss / totalInvested) * 100 
      : 0;

    const previousTotalValue = totalPortfolioValue - dailyProfitLoss;
    const dailyProfitLossPercent = previousTotalValue > 0 
      ? (dailyProfitLoss / previousTotalValue) * 100 
      : 0;

    return {
      totalAssetsValue,
      cashBalance,
      totalPortfolioValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent,
      dailyProfitLoss,
      dailyProfitLossPercent,
      assetCount: assets.length,
    };
  }, [assets, cashBalance]);

  // Asset category distribution
  const categoryDistribution: CategoryDistribution[] = useMemo(() => {
    const catMap: Record<AssetCategory, number> = {
      bist: 0,
      crypto: 0,
      gold: 0,
      fund: 0,
      fx: 0,
      cash: cashBalance,
    };

    assets.forEach((a) => {
      const val = a.shares * a.currentPrice;
      catMap[a.category] = (catMap[a.category] || 0) + val;
    });

    const total = summary.totalPortfolioValue || 1;

    return Object.entries(catMap)
      .map(([catKey, value]) => {
        const category = catKey as AssetCategory;
        return {
          category,
          name: CATEGORY_META[category].name,
          value: Number(value.toFixed(2)),
          percentage: Number(((value / total) * 100).toFixed(1)),
          color: CATEGORY_META[category].color,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [assets, cashBalance, summary.totalPortfolioValue]);

  return (
    <PortfolioContext.Provider
      value={{
        user,
        authLoading,
        isSyncing,
        assets,
        transactions,
        watchlist,
        cashBalance,
        summary,
        categoryDistribution,
        alerts,
        latestTriggeredAlert,
        notificationPermission,
        addAlert,
        updateAlert,
        deleteAlert,
        toggleAlertActive,
        rearmAlert,
        dismissLatestTriggeredAlert,
        testAlertNotification,
        requestBrowserPermission,
        buyAsset,
        sellAsset,
        depositCash,
        withdrawCash,
        updateAsset,
        updateAssetPrice,
        deleteAsset,
        addToWatchlist,
        removeFromWatchlist,
        refreshAllPrices,
        resetToSampleData,
        loginWithGoogle,
        logout,
      }
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
