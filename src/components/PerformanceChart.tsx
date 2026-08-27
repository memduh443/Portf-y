import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Activity, BarChart2, Calendar, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const PerformanceChart: React.FC = () => {
  const { summary } = usePortfolio();
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [showBenchmark, setShowBenchmark] = useState(false);

  // Generate realistic historical performance data points based on actual portfolio value & cost
  const chartData = useMemo(() => {
    const totalCurrent = summary.totalPortfolioValue || 65000;
    const totalCost = summary.totalInvested || 55000;

    let pointsCount = 30;
    let labelFormat: 'day' | 'month' | 'week' = 'day';

    switch (timeRange) {
      case '1W':
        pointsCount = 7;
        labelFormat = 'day';
        break;
      case '1M':
        pointsCount = 30;
        labelFormat = 'day';
        break;
      case '3M':
        pointsCount = 45;
        labelFormat = 'week';
        break;
      case '6M':
        pointsCount = 60;
        labelFormat = 'week';
        break;
      case '1Y':
        pointsCount = 52;
        labelFormat = 'month';
        break;
      case 'ALL':
        pointsCount = 70;
        labelFormat = 'month';
        break;
    }

    const data = [];
    const now = new Date();
    const startValue = totalCost * 0.94; // slight initial dip/curve
    const totalGrowth = totalCurrent - startValue;

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const date = new Date(now);

      if (timeRange === '1W') {
        date.setDate(now.getDate() - (pointsCount - 1 - i));
      } else if (timeRange === '1M') {
        date.setDate(now.getDate() - (pointsCount - 1 - i));
      } else if (timeRange === '3M' || timeRange === '6M') {
        date.setDate(now.getDate() - (pointsCount - 1 - i) * 3);
      } else {
        date.setDate(now.getDate() - (pointsCount - 1 - i) * 6);
      }

      // Natural realistic equity curve with slight wave & momentum
      const wave = Math.sin(i * 0.35) * (totalGrowth * 0.08) + Math.cos(i * 0.15) * (totalGrowth * 0.05);
      const randomNoise = (Math.sin(i * 1.7) * 0.02) * totalCurrent;
      
      let val = startValue + (totalGrowth * Math.pow(progress, 0.85)) + wave + randomNoise;
      if (i === pointsCount - 1) {
        val = totalCurrent; // strictly match current total at the end
      }

      const costBasis = totalCost * (0.85 + 0.15 * progress);
      const bistIndexVal = startValue * (1 + (progress * 0.12) + (Math.sin(i * 0.4) * 0.04));

      const dateLabel = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });

      data.push({
        date: dateLabel,
        fullDate: date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
        value: Math.round(val),
        cost: Math.round(costBasis),
        bist100: Math.round(bistIndexVal),
        profit: Math.round(val - costBasis),
      });
    }

    return data;
  }, [summary.totalPortfolioValue, summary.totalInvested, timeRange]);

  const minVal = useMemo(() => Math.min(...chartData.map((d) => d.value)), [chartData]);
  const maxVal = useMemo(() => Math.max(...chartData.map((d) => d.value)), [chartData]);
  const periodReturn = chartData.length > 1 
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100 
    : 0;

  return (
    <div className="bg-[#101728] p-4 sm:p-6 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Portföy Performans Grafiği
            </h2>
            <span className={`text-xs font-mono-numeric font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              periodReturn >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              <ArrowUpRight className="w-3 h-3" />
              {formatPercent(periodReturn)} ({timeRange})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Zaman içindeki kümülatif toplam varlık ve kâr gelişimi
          </p>
        </div>

        {/* Time Range Pills & Benchmark Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#0a0f1d] p-1 rounded-xl border border-slate-800">
            {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '1W' ? '1H' : range === '1M' ? '1A' : range === '3M' ? '3A' : range === '6M' ? '6A' : range === '1Y' ? '1Y' : 'TÜMÜ'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              showBenchmark
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BIST 100 Karşılaştır</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="bistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1000', 'dataMax + 1000']}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k ₺`}
              orientation="right"
              tickMargin={6}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0c121e]/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl font-mono-numeric text-xs">
                      <p className="text-slate-400 font-sans mb-1.5 pb-1 border-b border-slate-800 text-[11px]">
                        {data.fullDate}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Portföy Değeri:
                          </span>
                          <span>{formatCurrency(data.value)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Yatırılan Maliyet:
                          </span>
                          <span>{formatCurrency(data.cost)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-300">
                          <span>Dönemsel Kâr:</span>
                          <span className="font-semibold">{formatCurrency(data.profit)}</span>
                        </div>
                        {showBenchmark && (
                          <div className="flex items-center justify-between gap-4 text-cyan-300 pt-1 border-t border-slate-800">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              BIST 100 Endeks Sim:
                            </span>
                            <span>{formatCurrency(data.bist100)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Cost basis area */}
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#costGradient)"
              name="Yatırılan Maliyet"
            />

            {/* Benchmark line if enabled */}
            {showBenchmark && (
              <Area
                type="monotone"
                dataKey="bist100"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#bistGradient)"
                name="BIST 100 Göstergesi"
              />
            )}

            {/* Total Portfolio value area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#portfolioGradient)"
              name="Portföy Değeri"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-2 text-center text-xs font-mono-numeric">
        <div>
          <span className="text-slate-400 block text-[11px]">Dönem En Düşük</span>
          <span className="font-semibold text-slate-200">{formatCurrency(minVal, 0)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Dönem En Yüksek</span>
          <span className="font-semibold text-emerald-400">{formatCurrency(maxVal, 0)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Net Getiri Farkı</span>
          <span className="font-semibold text-emerald-300">{formatCurrency(summary.totalProfitLoss, 0)}</span>
        </div>
      </div>
    </div>
  );
};
