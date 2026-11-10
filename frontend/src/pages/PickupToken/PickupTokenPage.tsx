import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Download,
  Share2,
  Clock,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Phone,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  Button,
  Card,
} from '../../components/common';

export const PickupTokenPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Breadcrumb
          items={[
            { label: 'My Orders', href: '/orders' },
            { label: '#NB-CMT-102-GHEE', href: '/orders/IND-398' },
            { label: 'Pickup Token' },
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

      {/* Hero Pickup Ready Banner */}
      <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <Badge variant="green" size="md">
            READY FOR HUB PICKUP • Slot Active
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Batch is Ready for Collection at Indiranagar Hub!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Consolidated crate has arrived and unboxing inspection is verified. Present this digital pass and QR code to volunteer lead <strong>Suresh M.</strong> at Gate 2.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              WINDOW
            </div>
            <div className="font-bold text-sm mt-0.5">Today, 2:00 PM – 7:30 PM</div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              SEAL INTEGRITY
            </div>
            <div className="font-bold text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
              Batch Tamper Seal #GHEE-8419
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Pickup Pass Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital QR Pass */}
        <div className="lg:col-span-6 space-y-4">
          <Card padding="none" className="overflow-hidden border-2 border-emerald-700 dark:border-emerald-600 shadow-md">
            {/* Pass Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Neighbourhood Bulk Pass
                </div>
                <div className="text-sm font-bold mt-0.5">Indiranagar Cluster #04</div>
              </div>
              <span className="text-xs bg-emerald-700 px-2.5 py-1 rounded-full font-bold">
                Single Allocation
              </span>
            </div>

            {/* Pass Body (QR Code & PIN) */}
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-900">
              {/* Big QR Code with checkmark badge */}
              <div className="relative p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white shadow-inner">
                <QrCode className="w-56 h-56 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 border-4 border-white text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                (((•))) SCAN AT HUB DESK
              </div>

              {/* Backup PIN */}
              <div className="w-full max-w-xs p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">
                  MANUAL PICKUP PIN (BACKUP)
                </div>
                <div className="text-3xl font-black text-indigo-950 dark:text-indigo-200 tracking-widest font-mono mt-1">
                  PKP – 9842
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1">
                  Give this code to Suresh if the scanner camera has glare.
                </div>
              </div>

              {/* Reconciliation Status */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-left w-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Pre-paid &amp; Reconciled via UPI
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    UTR: 429810239410 • Saurashtra Co-op
                  </div>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">₹1,850 PAID</span>
              </div>

              {/* Pass Actions */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4 text-slate-600" />}
                  onClick={() => alert('Digital pass downloaded as image.')}
                >
                  Save Pass to Phone
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Share2 className="w-4 h-4 text-white" />}
                  className="bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => alert('Opening WhatsApp to share token with family member.')}
                >
                  Forward on WhatsApp
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-xs text-slate-500 text-center">
            Sending a family member or neighbor? Simply forward a screenshot of this QR token or PIN. They can inspect and claim on your behalf.
          </p>
        </div>

        {/* Right Column: Item Allocation & Hub Pickup Point */}
        <div className="lg:col-span-6 space-y-6">
          {/* Item Allocated Card */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ITEM ALLOCATED</span>
              <span className="text-xs font-mono text-slate-400">Batch #IND-398</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80"
                  alt="Ghee"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  A2 Gir Cow Bilona Ghee
                </h4>
                <p className="text-xs text-slate-500">
                  1 Litre Heavy Glass Jar • Cultured Curd Churned
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="blue" size="sm">Saurashtra Co-op</Badge>
                  <Badge variant="green" size="sm">✓ Lab Certified</Badge>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Pre-negotiated Bulk Price</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹1,850.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Freight to Hub &amp; Unloading</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">FREE (Co-op Collective)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Your Collective Saving</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹550 saved vs retail</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span>Total Settled</span>
                <span className="text-base font-black">₹1,850.00</span>
              </div>
            </div>
          </Card>

          {/* Pickup Node Card */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>PICKUP NODE #04</span>
              </div>
              <Badge variant="blue" size="sm">Ground Floor</Badge>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Indiranagar Club – Gate 2
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                Opposite BDA Complex, near badminton court entry
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="w-full mt-2"
              onClick={() => window.open('https://maps.google.com/?q=Indiranagar+Club+Bengaluru', '_blank')}
            >
              Get Directions on Google Maps
            </Button>
          </Card>

          {/* Hub Coordinator Contact */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">YOUR HUB COORDINATOR</span>
              <Badge variant="green" size="sm">✓ On Duty</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center">
                SM
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Suresh M.</h4>
                <div className="text-xs text-slate-500">
                  Apt 402, Oakwood Greens (Neighbor Lead)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a href="tel:+919845011223" className="block">
                <Button variant="outline" size="sm" leftIcon={<Phone className="w-3.5 h-3.5 text-slate-600" />} className="w-full">
                  Call Suresh
                </Button>
              </a>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-white" />}
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={() => window.open('https://wa.me/919845011223', '_blank')}
              >
                WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Community Handover Protocol (3 Steps) */}
      <Card padding="lg" className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            NEIGHBOURHOOD QUALITY ASSURANCE
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            Community Inspection &amp; Handover Protocol
          </h3>
          <p className="text-xs text-slate-500">
            Every NeighbourBuy bulk drop uses an open-box community verification before you carry your items home. Please take 60 seconds at the gate table:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Inspect Glass Jar Seal</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Examine the unbroken holographic Saurashtra dairy strip over the lid. Ensure no transit hairline cracks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Confirm Weight &amp; Tag</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Weighing scale is open at Gate 2. Confirm your gross weight matches 1.0 kg net label (approx. 1.48 kg with heavy glass jar).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Volunteer Scan Out</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Suresh or co-lead will scan your pass QR. This locks fulfillment on the cooperative ledger and logs your batch as received.
            </p>
          </div>
        </div>
      </Card>

      {/* Upcoming Cluster Run */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 shadow-2xs flex-shrink-0">
            🫒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Upcoming Cluster Run</span>
              <Badge variant="green" size="sm">Opens this Friday</Badge>
            </div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
              Wood Cold-Pressed Groundnut Oil (5 L Tin)
            </h5>
            <p className="text-[11px] text-slate-500">
              Direct from Dharwad Farmer Producer Company. Group target: 60 tins at ₹980/tin.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
          className="whitespace-nowrap"
          onClick={() => alert('Subscribed to WhatsApp notification for Friday cluster run!')}
        >
          Notify Me on WhatsApp
        </Button>
      </div>
    </div>
  );
};
