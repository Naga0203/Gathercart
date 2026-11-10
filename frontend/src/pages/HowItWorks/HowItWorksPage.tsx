import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Lock,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Pledge Quantity with Neighbours',
      description: 'Choose your staple groceries (aged rice, cold-pressed oils, bilona ghee). Reserve 1 to 3 bags for your household with ₹0 advance payment.',
      icon: <Users className="w-6 h-6 text-emerald-600" />,
    },
    {
      num: '02',
      title: 'Quota Reached & Mill Order Locked',
      description: 'When the neighbourhood circle hits the wholesale minimum (e.g. 250 kg), the cooperative discount locks in and the farm batch is reserved.',
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
    },
    {
      num: '03',
      title: 'Direct Co-op UPI Payment',
      description: 'Pay directly to the APMC registered farmer cooperative via GPay, PhonePe, or BHIM. Zero middlemen markups or platform delivery fees.',
      icon: <Building2 className="w-6 h-6 text-emerald-600" />,
    },
    {
      num: '04',
      title: 'Community Hub Pickup',
      description: 'Collect your order from your neighborhood volunteer pickup point (e.g. Indiranagar Club) using your digital QR pass or manual PIN.',
      icon: <Truck className="w-6 h-6 text-emerald-600" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="green" size="md">
          COMMUNITY GROUP BUYING MODEL
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How NeighbourBuy Works
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We aggregate orders within residential clusters in India to bypass retail distributors, unlocking wholesale mill-gate prices directly for apartments and streets.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <Card key={idx} padding="md" className="space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-2xl font-black text-slate-200 dark:text-slate-800 font-mono">
                  {s.num}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {s.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA Box */}
      <div className="rounded-3xl bg-emerald-800 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">
            Ready to save 20–30% on your household groceries?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Explore verified active batches in your neighbourhood. Join a pool in 30 seconds with zero upfront commitment.
          </p>
        </div>

        <Link to="/">
          <Button
            variant="secondary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="whitespace-nowrap bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
          >
            Explore Active Offers
          </Button>
        </Link>
      </div>
    </div>
  );
};
