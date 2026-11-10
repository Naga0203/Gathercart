import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  ProgressBar,
  PriceDisplay,
  QuantitySelector,
  Button,
  Card,
  Modal,
} from '../../components/common';

export const OfferDetailPage: React.FC = () => {
  const [pledgeQty, setPledgeQty] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQty, setModalQty] = useState(2);

  const price = 649;
  const mrp = 850;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Pool Bar & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Breadcrumb
          items={[
            { label: 'Indiranagar Cluster', href: '/' },
            { label: 'Grains & Staples', href: '/' },
            { label: 'Sona Masoori Raw Rice (10 kg)' },
          ]}
        />

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Active Offers</span>
        </Link>
      </div>

      {/* Cluster Sub-header Ticker */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/60 text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Indiranagar Central Cluster Pool</span>
          <span>•</span>
          <span>Lead Organiser: <strong>Suresh K. (12th Main)</strong></span>
        </div>
        <div className="text-slate-600 dark:text-slate-400">
          Hub Drop: <strong>Indiranagar Club Entrance (Gate 2)</strong>
        </div>
      </div>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Co-op Profile */}
        <div className="lg:col-span-7 space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="relative h-96 bg-slate-100 dark:bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80"
                alt="Sona Masoori Raw Rice"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="green" size="md">
                  OPEN FOR PLEDGES
                </Badge>
                <Badge variant="outline-green" size="md" icon={<BadgeCheck className="w-4 h-4 text-emerald-600" />}>
                  Pesticide Residue Tested
                </Badge>
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-lg">
                Batch #RC-2023-SM8 • Tested Batch Analysis Available
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-emerald-600 overflow-hidden cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80"
                    alt="Rice thumb 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                    alt="Rice thumb 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium">3 verified photos</span>
            </div>
          </Card>

          {/* Mill & Farmer Co-op Profile */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Mill &amp; Farmer Co-op Profile
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Raichur Farmer Producer Co-operative
                </h3>
                <p className="text-xs text-slate-500">Tungabhadra Basin, Raichur District, Karnataka</p>
              </div>
              <Badge variant="blue" size="sm">
                Co-op ID: KA-RAI-048
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Harvest Date</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Nov 2023</div>
                <div className="text-[10px] text-emerald-600 font-medium">Naturally Aged</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Moisture Level</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">&lt; 11.8%</div>
                <div className="text-[10px] text-slate-500 font-medium">Optimal Cook</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Grain Type</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Medium Raw</div>
                <div className="text-[10px] text-slate-500 font-medium">Aromatic &amp; Light</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Processing</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Zero Wax</div>
                <div className="text-[10px] text-slate-500 font-medium">Single Polish</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 leading-relaxed">
              ✓ Direct procurement eliminates 3 intermediate middlemen (distributors, city commission agents, and retail kirana markups). 100% of proceeds go directly to the cooperative pool account.
            </p>
          </Card>

          {/* Recent Neighbours who joined */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local Community Pulse</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent neighbours who joined this batch</h4>
              </div>
              <Badge variant="green" size="sm">
                14 Households Participating
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  PM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Priya M.</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-semibold">2 bags</span>
                  </div>
                  <div className="text-[10px] text-slate-400">6th Main, Indiranagar • 18m ago</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                  KR
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Karthik R.</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-800 font-semibold">1 bag</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Defence Colony • 45m ago</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                  AD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Anand &amp; Deepa</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-800 font-semibold">1 bag</span>
                  </div>
                  <div className="text-[10px] text-slate-400">HAL 2nd Stage • 2h ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing, Batch Progress & Pledge Action */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="lg" className="space-y-6 sticky top-24">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Wholesale Collective Batch #8
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-tight">
                Sona Masoori Raw Rice (Aged 12 Months)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                10 kg Food-Grade Cotton Lined Bag • Direct Mill Sourced
              </p>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
              <PriceDisplay price={price} mrp={mrp} size="lg" />
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
                Free Community Hub Drop Included
              </div>
            </div>

            {/* Quota Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  23 of 25 joined
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">92% target met</span>
              </div>

              <ProgressBar current={23} total={25} variant="emerald" />

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Almost there! Just 2 more bags needed
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Ends in 18h 30m
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>Wholesale Quota: 25 Bags (250 kg)</span>
                <span>Household Limit: Max 3 bags</span>
              </div>
            </div>

            {/* Quantity Selector & Calculation */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Bags to Pledge:
                </span>
                <QuantitySelector
                  value={pledgeQty}
                  onChange={setPledgeQty}
                  min={1}
                  max={3}
                  unit="bag"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-600 dark:text-slate-400">Order calculation:</span>
                <span className="text-slate-900 dark:text-white">
                  {pledgeQty} × ₹{price} = <strong className="text-sm">₹{(pledgeQty * price).toLocaleString('en-IN')} total</strong>
                </span>
              </div>
            </div>

            {/* Primary Pledge CTA */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setModalQty(pledgeQty);
                  setIsModalOpen(true);
                }}
                className="w-full text-base font-bold"
              >
                Pledge {pledgeQty} Bag{pledgeQty > 1 ? 's' : ''} (₹0 Upfront) →
              </Button>

              <div className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-tight">
                No money collected right now. You will only receive a direct secure UPI payment request (GPay/PhonePe/Paytm) once the 25th bag pledge is locked.
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-4 h-4 text-emerald-600" />}
                className="w-full mt-2"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Batch link copied! Share with your apartment building.');
                }}
              >
                Share to Apartment WhatsApp to lock remaining 2 bags
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Screen 4: Join Collective Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <span>Join Collective Batch #8</span>
            <Badge variant="green" size="sm">Active Pool</Badge>
          </div>
        }
        subtitle="Lock community wholesale pricing with neighbours"
      >
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80"
                alt="Rice bag"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                Raichur Co-op Mill • Aged 12 Mo.
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Sona Masoori Raw Rice (10 kg bag)
              </h4>
              <PriceDisplay price={price} mrp={mrp} size="sm" />
            </div>
          </div>

          {/* Progress Alert */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Batch Progress: 23 of 25 pledged
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                Only 2 bags to unlock!
              </span>
            </div>
            <ProgressBar current={23} total={25} variant="emerald" />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Quota target: 250 kg collective batch</span>
              <span>Est. lock: Today in ~45 mins</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Select Quantity</span>
                  <Badge variant="blue" size="sm">Limit: 3 Bags</Badge>
                </div>
                <div className="text-[11px] text-slate-500">
                  Max 3 bags (30 kg) per household for equitable community access.
                </div>
              </div>
              <QuantitySelector
                value={modalQty}
                onChange={setModalQty}
                min={1}
                max={3}
                unit="bags"
              />
            </div>
          </div>

          {/* Cost & Community Savings Ledger */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Cost &amp; Community Savings Ledger
            </h5>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
              <span>Wholesale Pledge Price ({modalQty} × 10 kg bags)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{(modalQty * price).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>MRP Retail Value</span>
              <span className="line-through text-slate-400">
                ₹{(modalQty * mrp).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Community Hub Bulk Logistics</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between text-sm font-bold">
              <span className="text-slate-900 dark:text-white">Total Due at Milestone Lock</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ₹{(modalQty * price).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold text-right">
              You save ₹{(modalQty * (mrp - price)).toLocaleString('en-IN')} (24%) vs retail
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Drop-off &amp; Pick-up Location</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Cluster Indiranagar – 560038
            </span>
          </div>

          {/* Modal Actions */}
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold"
              onClick={() => {
                alert(`Pledge of ${modalQty} bag(s) confirmed! Redirecting to My Orders.`);
                setIsModalOpen(false);
              }}
            >
              Confirm Pledge for {modalQty} Bags (₹0 Due Now) →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-500"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel &amp; Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
