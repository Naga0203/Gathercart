import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  QrCode,
  Copy,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  Button,
  Card,
  PriceDisplay,
} from '../../components/common';

export const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [utrNumber, setUtrNumber] = useState('429810239410');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText('coop.saurashtra@okhdfcbank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (!utrNumber || utrNumber.length < 10) {
      alert('Please enter a valid 12-digit UPI reference number.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      navigate('/orders/IND-398/pickup-token');
    }, 800);
  };

  const quotaPool = [
    { name: 'Priya M.', initials: 'PM', color: 'bg-emerald-700' },
    { name: 'You (An...)', initials: 'A', color: 'bg-emerald-800' },
    { name: 'Rajesh K.', initials: 'RK', color: 'bg-blue-700' },
    { name: 'Vikram R.', initials: 'VR', color: 'bg-slate-700' },
    { name: 'Meera T.', initials: 'MT', color: 'bg-amber-700' },
    { name: 'Deepak S.', initials: 'DS', color: 'bg-indigo-700' },
    { name: 'Kavita N.', initials: 'KN', color: 'bg-rose-700' },
    { name: 'Siddharth', initials: 'S', color: 'bg-teal-700' },
    { name: 'Arun P.', initials: 'AP', color: 'bg-purple-700' },
    { name: '+6 Others', initials: '+6', color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Breadcrumb
          items={[
            { label: 'My Orders', href: '/orders' },
            { label: 'Order #NB-CMT-102-GHEE' },
          ]}
        />

        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>
      </div>

      {/* Sub-Header Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="sm">ACTIVE BATCH</Badge>
          <span>Batch #IND-398</span>
          <span>•</span>
          <span>Indiranagar Hub 04 • Cluster A</span>
        </div>
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Window Closes: Today, 2:00 PM</span>
        </div>
      </div>

      {/* Action Banner */}
      <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase">
              Action Required
            </span>
            <Badge variant="green" size="sm">15 / 15 Families Locked</Badge>
            <span className="text-[11px] text-slate-500">Pledged on Oct 22, 2024</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Batch Quota Reached! Transfer payment directly to unlock wholesale dispatch.
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            The Saurashtra Producer Co-operative requires order pre-clearance before batch dispatch from Rajkot facility.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 text-right flex-shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">Payment Window Expires In</div>
          <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            03h 48m 12s
          </div>
          <div className="text-[10px] text-slate-400">Release to waitlist at 2:00 PM</div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lifecycle, Item, Hub Lead, Quota Pool */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stepper Lifecycle */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Community Order Lifecycle
              </h3>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Stage 3 of 4
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    1. Zero-Cost Family Pledge
                  </div>
                  <span className="text-[11px] text-slate-400">Oct 20, 06:40 PM</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  You pledged 1x 1L Glass Jar at wholesale rate. Zero advance money collected.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    2. Neighbourhood Quota Met
                  </div>
                  <span className="text-[11px] text-slate-400">Today, 10:12 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  15 of 15 orders confirmed by Indiranagar Cluster! Bulk producer discount of 23% unlocked.
                </p>
              </div>

              {/* Step 3 (Active) */}
              <div className="relative bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="absolute -left-8 top-3 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>3. Direct UPI Settlement</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-200 text-amber-900 font-bold uppercase">
                      Action Required
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-bold">Due by 02:00 PM</span>
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1">
                  Pay direct to co-op account via UPI. Submit your 12-digit UTR reference below to confirm your spot.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative opacity-60">
                <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    4. Dispatch &amp; Hub Self-Pickup
                  </div>
                  <span className="text-[11px] text-slate-400">Wed, Oct 25</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Consolidated climate-controlled crate arrives at Indiranagar Club Gate 2. Pick up with QR token.
                </p>
              </div>
            </div>
          </Card>

          {/* Allocated Item Details */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Allocated Item</span>
              <span className="text-[11px] font-mono text-slate-400">ITEM #GHEE-BILONA-1L</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80"
                  alt="Ghee"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Saurashtra Organic Co-op, Rajkot</span>
                  <Badge variant="green" size="sm">✓ Lab Verified</Badge>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  A2 Gir Cow Bilona Ghee (1 L Glass Jar)
                </h4>
                <p className="text-xs text-slate-500">
                  Pure curd-churned Vedic bilona method, free-grazing indigenous Saurashtra Gir cows. Certified A2 Beta-Casein.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <PriceDisplay price={1850} mrp={2400} size="sm" />
                  <span className="text-xs text-slate-400">• Allocated: <strong>1 Unit (1 L)</strong></span>
                </div>
              </div>
            </div>
          </Card>

          {/* Hub Coordinator Card */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Hub Pickup &amp; Volunteer Coordinator
              </div>
              <Badge variant="blue" size="sm">Hub Node #04</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Pickup Spot</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">Indiranagar Club – Gate 2</div>
                <div className="text-slate-500 mt-0.5">100 Feet Rd, HAL 2nd Stage, Bengaluru – 560038</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Time Slot: Wed, 2:00 PM – 7:30 PM</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Hub Volunteer Lead</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">Suresh M.</div>
                <div className="text-slate-500">Apartment 402, Oakwood Greens</div>
                <div className="flex items-center gap-3 mt-2">
                  <a href="tel:+919845011223" className="flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                    <Phone className="w-3.5 h-3.5" /> +91 98450 11223
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Quota Pool Avatars */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Neighbourhood Quota Pool
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                15 / 15 Filled (100%)
              </span>
            </div>

            <p className="text-xs text-slate-500">
              These 15 families in Indiranagar pooled together to achieve the 15-litre dairy co-operative crate minimum.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {quotaPool.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <div className={`w-5 h-5 rounded-full ${p.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {p.initials}
                  </div>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Direct Co-op Transfer Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="lg" className="space-y-6 border-2 border-emerald-600/30 dark:border-emerald-500/30">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Badge variant="green" size="md">Direct Co-op Transfer</Badge>
              <span className="text-xs font-mono text-slate-400">Batch #IND-398</span>
            </div>

            {/* Payable Amount Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Net Payable Amount</span>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Platform Markup &amp; Delivery Fee: FREE (₹0.00)
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹1,850.00
              </div>
            </div>

            {/* UPI Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold bg-emerald-700 hover:bg-emerald-800"
              onClick={() => {
                alert('Opening UPI app (GPay/PhonePe) with pre-filled VPA and amount.');
              }}
            >
              Open UPI App to Pay ₹1,850
            </Button>

            <div className="text-center text-xs text-slate-400 font-semibold tracking-wider uppercase">
              OR SCAN CO-OP QR CODE
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                <QrCode className="w-40 h-40 text-slate-800" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Scan with Any Banking / UPI App
                </div>
                <div className="text-[11px] text-slate-500">
                  Merchant: Saurashtra Organic Dairy Co-op
                </div>
              </div>

              {/* VPA Copy Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300">coop.saurashtra@okhdfcbank</span>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="text-emerald-600 hover:text-emerald-700 font-sans font-bold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* UTR Reference Input & Verification */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Confirm Payment via 12-Digit UPI Reference (UTR)
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 429810239410"
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono tracking-wider"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isVerifying}
                  onClick={handleVerify}
                  className="whitespace-nowrap font-bold"
                >
                  Verify &amp; Lock
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Find the 12-digit UPI Transaction ID or UTR number in your payment receipt on GPay, PhonePe, or BHIM.
              </p>
            </div>
          </Card>

          {/* Zero Risk Assurance */}
          <Card variant="subtle" padding="sm" className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Risk Community Buying</span>
            </div>
            <p className="text-slate-500">
              Direct producer remittance: 100% of your ₹1,850 goes directly to Saurashtra Organic Dairy Co-op's official APMC bank account.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
