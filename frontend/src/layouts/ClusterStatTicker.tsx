import React from 'react';
import { Users, TrendingUp, Truck } from 'lucide-react';

export interface ClusterStatTickerProps {
  familiesCount?: number;
  savingsThisMonth?: string;
  nextDelivery?: string;
  clusterName?: string;
}

export const ClusterStatTicker: React.FC<ClusterStatTickerProps> = ({
  familiesCount = 248,
  savingsThisMonth = '₹1,42,800',
  nextDelivery = 'Thursday 4 PM',
  clusterName = 'Indiranagar',
}) => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 py-2 px-4 text-xs font-medium text-emerald-900 dark:text-emerald-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
            <Users className="w-3 h-3" />
          </div>
          <span>
            <strong className="font-bold">{familiesCount} families</strong> participating in {clusterName} cluster
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>
              <strong className="font-bold text-emerald-800 dark:text-emerald-300">{savingsThisMonth}</strong> saved this month
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Truck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>
              Next delivery: <strong className="font-semibold">{nextDelivery}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

