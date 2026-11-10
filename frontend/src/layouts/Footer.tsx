import React from 'react';
import { Headphones } from 'lucide-react';
import { TrustBadgesRow } from './TrustBadgesRow';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
      <TrustBadgesRow />

      <div className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <span>
              Need assistance? Contact support at{' '}
              <a
                href="mailto:care@neighbourbuy.in"
                className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                care@neighbourbuy.in
              </a>{' '}
              or{' '}
              <a
                href="tel:18004204762"
                className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                1800-420-GROC
              </a>
            </span>
          </div>

          <div className="text-center sm:text-right">
            © 2025 NeighbourBuy India Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
