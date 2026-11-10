import React from 'react';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const TrustBadgesRow: React.FC = () => {
  const badges = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Pay only after confirmation',
      description: 'No upfront payment. Collective bulk deals confirmed once the neighbourhood quota is reached.',
    },
    {
      icon: <Truck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Direct from mills & farms',
      description: 'Fresh harvest sourced unadulterated straight from regional agricultural co-ops and local mills.',
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Zero cancellation charges',
      description: 'Change your mind anytime before batch lock. Transparent, zero hassle community buying.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center flex-shrink-0">
              {badge.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

