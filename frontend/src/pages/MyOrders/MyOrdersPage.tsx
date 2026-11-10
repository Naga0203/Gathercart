import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Share2,
  Trash2,
  Edit2,
  ArrowRight,
  TrendingUp,
  Package,
  Weight,
  MessageSquare,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  ProgressBar,
  PriceDisplay,
  Button,
  Card,
} from '../../components/common';

export const MyOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'My Orders' }]} />

      {/* Header and Cluster Lifetime Savings Widget */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <Badge variant="green" size="sm" className="mb-2">
            INDIRANAGAR BUYING CIRCLE #560038
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Neighbourhood Orders &amp; Pledges
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Track group milestone progress, payment links, and pickup schedules for your community buying collective. Pay only when your circle hits target wholesale volume.
          </p>
        </div>

        {/* Lifetime Savings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-6">
          <div className="pr-6 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Lifetime Savings
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">₹4,280</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              6 Batches Completed
            </div>
          </div>

          <div className="pr-6 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Active
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">2 Items</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Weight className="w-3.5 h-3.5 text-amber-600" />
              Weight
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">60 kg</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Active Pledges</span>
          <span className="w-4 h-4 rounded-full bg-emerald-700 dark:bg-emerald-800 text-[10px] font-bold text-white flex items-center justify-center">
            2
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Completed &amp; Delivered</span>
          <span className="text-[10px] text-slate-400 font-semibold">3</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'cancelled'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Closed &amp; Cancelled</span>
          <span className="text-[10px] text-slate-400 font-semibold">1</span>
        </button>
      </div>

      {/* Active Pledges List */}
      <div className="space-y-6">
        {/* Urgent Action Card 1: Ghee Batch Full */}
        <Card padding="none" className="overflow-hidden border-2 border-amber-300 dark:border-amber-700">
          <div className="bg-amber-600 text-white px-5 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Batch Quota Full! Action Required</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-700/80 px-2.5 py-0.5 rounded-full font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Pay window closes in: 03h 48m</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80"
                    alt="Ghee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">Batch #IND-398</Badge>
                    <Badge variant="green" size="sm">15 / 15 pledged (100%)</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    A2 Gir Cow Bilona Ghee (1 L Glass Jar)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Farm: Saurashtra Organic Dairy Co-op, Rajkot • Shipped cold-pressed
                  </p>
                  <PriceDisplay price={1850} mrp={2400} size="sm" className="mt-2" />
                </div>
              </div>

              {/* Hub Pickup Info */}
              <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Hub Pickup Details</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Indiranagar Club Gate 2
                </div>
                <div className="text-slate-500">Dispatch: Wed, 2:00 PM</div>
                <div className="text-slate-500">Hub Lead: Suresh M. (Apt 402)</div>
              </div>
            </div>

            {/* Notification message */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold">Group target unlocked! Payment link is now open.</div>
              <p>
                Please complete your direct UPI payment of <strong>₹1,850</strong> before Wednesday 11:00 AM to confirm collective dispatch from Saurashtra Dairy. No additional platform or delivery charges.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                Commitment ID: NB-CMT-102-GHEE
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link to="/orders/IND-398" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="sm" className="w-full">
                    View Batch Details
                  </Button>
                </Link>

                <Link to="/orders/IND-398" className="flex-1 sm:flex-none">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full bg-emerald-700 hover:bg-emerald-800"
                  >
                    Pay ₹1,850 via UPI →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Rice Batch (Still in progress) */}
        <Card padding="md" className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
                  alt="Rice"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">Batch #IND-409</Badge>
                  <Badge variant="green" size="sm">Pledges Open</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Sona Masoori Raw Rice (Aged 12 Months)
                </h3>
                <p className="text-xs text-slate-500">
                  Kurnool Direct Rice Mill • 10 kg Family Pack
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    ₹1,298
                  </span>
                  <span className="text-xs text-slate-400">(2 bags × ₹649)</span>
                  <Badge variant="green" size="sm">₹0 Due Today</Badge>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Delivery Node</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Indiranagar Club Gate 2</div>
              <div>Est. Pickup: Thursday 4:00 PM</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-bold">Free Community Drop</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Batch Progress: 23 of 25 bags pledged (92%)</span>
              <span className="text-slate-500 flex items-center gap-1 font-normal">
                <Clock className="w-3.5 h-3.5" /> Closes in 4 hours 12 mins
              </span>
            </div>
            <ProgressBar current={23} total={25} variant="emerald" />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                🔥 Only 2 more bags needed to lock wholesale pricing of ₹64.9/kg.
              </span>
              <span>Target: 250 kg minimum batch</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Payment link will be auto-generated and notified via WhatsApp &amp; SMS as soon as the last 2 bags are claimed by neighbours.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => alert('Pledge cancellation is allowed. Spot will be re-opened for neighbours.')}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Leave Group / Cancel Pledge</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Opening quantity modification modal.')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 font-semibold flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modify Quantity (2)</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin);
                alert('Pledge link copied to clipboard!');
              }}
            >
              Share with Neighbours
            </Button>
          </div>
        </Card>
      </div>

      {/* WhatsApp Community Desk CTA */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <strong>Have questions about your Indiranagar delivery slot?</strong>
          <div className="text-slate-500 dark:text-slate-400">
            Coordinator Ananya or our WhatsApp buying desk is here to help.
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}>
          WhatsApp Community Desk
        </Button>
      </div>
    </div>
  );
};
