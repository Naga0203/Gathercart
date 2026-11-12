import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ShoppingBag, HelpCircle, ClipboardList, User } from 'lucide-react';
import { Header } from './Header';
import { ClusterStatTicker } from './ClusterStatTicker';
import { Footer } from './Footer';

export interface MainLayoutProps {
  showTicker?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ showTicker = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16 md:pb-0">
      {showTicker && <ClusterStatTicker />}
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg transition-colors"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
              isActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Offers</span>
        </NavLink>

        <NavLink
          to="/how-it-works"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
              isActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <HelpCircle className="w-5 h-5" />
          <span>How It Works</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
              isActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-700 text-white dark:bg-emerald-500 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </div>
          <span>My Orders</span>
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
              isActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
