import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ClusterStatTicker } from './ClusterStatTicker';
import { Footer } from './Footer';

export interface MainLayoutProps {
  showTicker?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ showTicker = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {showTicker && <ClusterStatTicker />}
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

