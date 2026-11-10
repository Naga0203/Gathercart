import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Input, Button, Card, Badge } from '../../components/common';

export const RegisterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [handoverPreference, setHandoverPreference] = useState<'club' | 'guard'>('club');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Pledge in progress top alert */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Pledge in progress
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-300">
                ₹0 due today
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Your pledge for <strong>2 bags (50 kg)</strong> of Premium Aged Sona Masoori Rice (₹1,450 total) will be linked instantly upon sign-in.
            </p>
          </div>
        </div>

        <div className="text-right sm:self-center self-end">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Estimated Savings: ₹640
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">vs. local retail price</div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cooperative Story & Benefits */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <Badge variant="outline-green" size="md">
              Indiranagar Cooperative
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fresh harvest wholesale, ordered with neighbours.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bypass retail middlemen. Join your local apartment and street clusters across Indiranagar to unlock genuine mill-gate pricing.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-500">₹0 Upfront</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pledge freely. Pay only when 20+ neighbours lock in.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-500">25–35% Off</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct from regional APMC co-ops &amp; cold-press mills.
              </div>
            </div>
          </div>

          {/* Guarantee Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero financial risk</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If the quota isn't reached, the order expires silently with zero penalty or charge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Consolidated neighborhood delivery</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Single truck delivery directly to Indiranagar Club or dropped at your apartment lobby.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verified Resident Hub</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Coordinated by volunteer neighborhood cluster captains across 100 Feet Rd &amp; Defence Colony.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <Card variant="subtle" padding="sm" className="space-y-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs italic text-slate-700 dark:text-slate-300">
              "We saved ₹2,400 last month on premium aged rice and cold-pressed groundnut oil just by pooling orders with 6 families in our building on 12th Main."
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                P
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Priya Sharma</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                  • Defence Colony, Active Member
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7">
          <Card padding="lg" className="space-y-6">
            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'register'
                    ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'login'
                    ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeTab === 'register' ? 'Join the Indiranagar Cluster' : 'Welcome back to NeighbourBuy'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'register'
                  ? 'Zero fees today. Fill details below to associate your 50 kg rice pledge and unlock local cluster access.'
                  : 'Enter your credentials to manage your cluster pledges.'}
              </p>
            </div>

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {activeTab === 'register' && (
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Ananya Sharma"
                  defaultValue="Ananya Sharma"
                />
              )}

              <Input
                label="WhatsApp / Mobile Number"
                required
                placeholder="98765 43210"
                defaultValue="98765 43210"
                leftAddon={<span className="text-xs font-bold text-slate-600 dark:text-slate-300">🇮🇳 +91</span>}
                helperText="Used exclusively for payment confirmation link when the cluster hits 20 pledges."
              />

              <Input
                label="Email Address"
                required
                type="email"
                placeholder="ananya.sharma@example.com"
                defaultValue="ananya.sharma@example.com"
              />

              <Input
                label={activeTab === 'register' ? 'Create Password' : 'Password'}
                required
                isPassword
                placeholder="Minimum 8 characters"
                defaultValue="secretPassword123"
              />

              {activeTab === 'register' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Delivery &amp; Apartment Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
                      placeholder="Flat No., Floor & Apartment / Villa Name"
                      defaultValue="Flat 402, Lotus Residency"
                    />
                    <input
                      type="text"
                      readOnly
                      className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 text-xs text-slate-600 dark:text-slate-400"
                      value="5th Cross, Indiranagar, Bengaluru – 560038"
                    />
                  </div>

                  {/* Handover Preference Radio */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Preferred Handover Preference
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setHandoverPreference('club')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                          handoverPreference === 'club'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="handover"
                          checked={handoverPreference === 'club'}
                          onChange={() => setHandoverPreference('club')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Indiranagar Club Gate 2
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            Free Community Pickup
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Direct from pallet truck. Zero markup.
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setHandoverPreference('guard')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                          handoverPreference === 'guard'
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="handover"
                          checked={handoverPreference === 'guard'}
                          onChange={() => setHandoverPreference('guard')}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Apartment Guard Desk
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                            +₹20 per 25kg bag
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Direct transfer to building desk.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent checkbox */}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 rounded-sm text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      I agree to participate in the Indiranagar buying cluster. I understand that payment is collected via UPI only after the mill order is confirmed.
                    </label>
                  </div>
                </>
              )}

              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full mt-4"
              >
                {activeTab === 'register' ? 'Create Account & Link 2-Bag Pledge' : 'Log In to Cluster'}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                No credit card required
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% genuine APMC certified
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Frequently Asked by Neighbours
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about collective mill-sourcing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">When do I actually pay?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never upfront. When our Indiranagar quota hits 100%, an official UPI payment link is dispatched via WhatsApp. You pay only after the mill dispatches the batch.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">How do I collect my 50 kg rice?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You can pick it up directly at the Indiranagar Club distribution point using your unique QR token, or opt for a building guard drop-off handled by our logistics partner.
            </p>
          </Card>

          <Card padding="md" className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">What if the quality isn't right?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              NeighbourBuy conducts physical lab testing for grain moisture and foreign matter before truck dispatch. If unsealed bags do not meet APMC grade 1 standards, full refunds are issued.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
