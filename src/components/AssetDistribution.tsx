import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Layers, Info } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const AssetDistribution: React.FC = () => {
  const { categoryDistribution, summary } = usePortfolio();

  return (
    <div className="bg-[#101728] p-4 sm:p-6 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30 flex flex-col justify-between">
      
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-white">
              Varlık Dağılımı
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono-numeric font-medium">
            Toplam: {formatCurrency(summary.totalPortfolioValue, 0)}
          </span>
        </div>

        {/* Donut Chart and Center Info */}
        <div className="relative h-48 sm:h-52 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="#0c121e"
                strokeWidth={2}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#0c121e]/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs font-mono-numeric">
                        <div className="flex items-center gap-2 font-bold text-white mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <span>Değer:</span>
                          <span className="font-semibold text-emerald-400">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-400">
                          <span>Portföy Payı:</span>
                          <span className="font-semibold text-cyan-300">%{item.percentage}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Toplam Pay</span>
            <span className="font-display font-extrabold text-base sm:text-lg text-white font-mono-numeric">
              {categoryDistribution.length} Sınıf
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown list */}
      <div className="space-y-2.5 mt-2 pt-3 border-t border-slate-800/80">
        {categoryDistribution.map((item) => (
          <div key={item.category} className="text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[130px] sm:max-w-none">{item.name}</span>
              </span>
              <div className="flex items-center gap-2 font-mono-numeric">
                <span className="font-semibold text-white">{formatCurrency(item.value, 0)}</span>
                <span className="text-slate-400 text-[11px] w-10 text-right font-medium">
                  %{item.percentage}
                </span>
              </div>
            </div>
            
            {/* Percentage Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(item.percentage, 2)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
