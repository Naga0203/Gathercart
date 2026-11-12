import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MapPin, ChevronDown, ShoppingBag, Menu, X, User, Check } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('Indiranagar, Bengaluru – 560038');
  const clusterDropdownRef = useRef<HTMLDivElement>(null);

  const availableClusters = [
    { name: 'Indiranagar, Bengaluru – 560038', activePools: 6, families: 248 },
    { name: 'Koramangala, Bengaluru – 560034', activePools: 4, families: 184 },
    { name: 'HSR Layout, Bengaluru – 560102', activePools: 5, families: 210 },
    { name: 'Whitefield, Bengaluru – 560066', activePools: 3, families: 145 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clusterDropdownRef.current &&
        !clusterDropdownRef.current.contains(event.target as Node)
      ) {
        setClusterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Cluster Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Neighbour<span className="text-emerald-700 dark:text-emerald-500">Buy</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                  GatherCart Platform
                </span>
              </div>
            </Link>

            {/* Location Selector Dropdown */}
            <div className="relative hidden lg:block" ref={clusterDropdownRef}>
              <button
                type="button"
                onClick={() => setClusterDropdownOpen(!clusterDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                aria-expanded={clusterDropdownOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                <span>{selectedCluster}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {clusterDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    Select Your Buying Cluster
                  </div>
                  {availableClusters.map((cluster) => (
                    <button
                      key={cluster.name}
                      type="button"
                      onClick={() => {
                        setSelectedCluster(cluster.name);
                        setClusterDropdownOpen(false);
                      }}
                      className="w-full flex items-start justify-between px-3.5 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                    >
                      <div>
                        <div
                          className={`font-semibold ${
                            selectedCluster === cluster.name
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cluster.name.split('–')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {cluster.families} families • {cluster.activePools} active pools
                        </div>
                      </div>
                      {selectedCluster === cluster.name && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Active Offers
            </NavLink>

            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              How It Works
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>My Orders</span>
              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </NavLink>
          </nav>

          {/* Right Controls: Theme Toggle & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              to="/register"
              className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Ananya S.
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedCluster}</span>
              </div>
            </div>

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              Active Offers
            </NavLink>

            <NavLink
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              How It Works
            </NavLink>

            <NavLink
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>My Orders</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
            </NavLink>

            <NavLink
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Account / Profile (Ananya S.)</span>
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};
