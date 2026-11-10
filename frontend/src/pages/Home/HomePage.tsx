import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Percent, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Badge, ProgressBar, CountdownTimer, PriceDisplay, Button, Card } from '../../components/common';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'ending_soon' | 'almost_there'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'rice', label: 'Rice & Grains', icon: '🌾' },
    { id: 'oil', label: 'Cold Pressed Oils', icon: '🫒' },
    { id: 'dal', label: 'Pulses & Dals', icon: '🫘' },
    { id: 'nuts', label: 'Dry Fruits', icon: '🥜' },
  ];

  // Reference mockup data aligned with Screen 1
  const sampleOffers = [
    {
      id: 1,
      name: 'Sona Masoori Raw Rice',
      description: 'Aged 12 Months • Direct from Raichur Mills',
      unitLabel: '10 kg bag',
      price: 649,
      mrp: 850,
      current: 23,
      target: 25,
      status: 'OPEN',
      endsIn: '18h 30m',
      isUrgent: false,
      contextMessage: 'Group goal almost reached! Fast locking',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Cold Pressed Groundnut Oil',
      description: 'Wood Churned (Mara Chekku) • Salem Mills',
      unitLabel: '5 L tin can',
      price: 990,
      mrp: 1250,
      current: 12,
      target: 15,
      status: 'OPEN',
      endsIn: '55m',
      isUrgent: true,
      contextMessage: 'Batch expires at 2:00 PM today',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Kashmiri Walnuts (In Shell)',
      description: 'Kashmir Valley Harvest • 2 kg jute sack',
      unitLabel: '2 kg sack',
      price: 1350,
      mrp: 1800,
      current: 9,
      target: 12,
      status: 'OPEN',
      endsIn: '14h',
      isUrgent: false,
      userJoinedQty: 2,
      contextMessage: 'You & 8 neighbours pledged',
      image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: 'Desi Toor Dal (Unpolished)',
      description: 'Organic Certified • Gulbarga Farmers Co.',
      unitLabel: '5 kg pack',
      price: 720,
      mrp: 900,
      current: 2,
      target: 20,
      status: 'OPEN',
      endsIn: '2d 4h',
      isUrgent: false,
      contextMessage: 'Offer just opened today',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 5,
      name: 'A2 Gir Cow Bilona Ghee',
      description: 'Traditional Curd Churned • Saurashtra Dairy',
      unitLabel: '1 L glass jar',
      price: 1850,
      mrp: 2400,
      current: 15,
      target: 15,
      status: 'CONFIRMED',
      endsIn: 'Locked',
      isUrgent: false,
      contextMessage: 'Locked & dispatched for delivery',
      image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 6,
      name: 'Alphonso Mango Pulp (Natural)',
      description: 'Ratnagiri Co-op • No Added Sugar',
      unitLabel: '6 × 850g tins',
      price: 1190,
      mrp: 1600,
      current: 7,
      target: 20,
      status: 'OFFER_ENDED',
      endsIn: 'Closed',
      isUrgent: false,
      contextMessage: 'No money was charged to anyone',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-10 border border-emerald-100/80 dark:border-emerald-900/40 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline-green" size="md" icon={<ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}>
            VERIFIED COOPERATIVE HUB
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Neighbourhood Group Offers in Indiranagar, Bengaluru
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Join bulk wholesale buys with neighbours in your locality. Pay only when the group target is reached and the mill shipment locks in.
          </p>

          {/* 3 Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                ₹0
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Zero upfront payment</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Pledge first, pay on lock</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Free delivery at 10+</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">To community drop point</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Direct mill pricing</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">20–30% below retail MRP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Categories Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              All Offers (6)
            </button>
            <button
              onClick={() => setActiveTab('ending_soon')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'ending_soon'
                  ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Ending soon (&lt;24h)
            </button>
            <button
              onClick={() => setActiveTab('almost_there')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'almost_there'
                  ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Almost there (≤5 units needed)
            </button>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium self-end sm:self-center">
            Displaying 6 verified group deals
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleOffers.map((offer) => {
          const remaining = offer.target - offer.current;
          const isFull = offer.current >= offer.target;
          const isClosed = offer.status === 'OFFER_ENDED';

          return (
            <Card
              key={offer.id}
              padding="none"
              className={`overflow-hidden flex flex-col justify-between hover:shadow-md transition group ${
                isClosed ? 'opacity-80' : ''
              }`}
            >
              <div>
                {/* Image & Header Badges */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {offer.status === 'CONFIRMED' ? (
                      <Badge variant="green" size="sm" icon={<Check className="w-3 h-3" />}>
                        CONFIRMED
                      </Badge>
                    ) : isClosed ? (
                      <Badge variant="gray" size="sm">
                        OFFER ENDED
                      </Badge>
                    ) : (
                      <Badge variant="green" size="sm">
                        OPEN
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <CountdownTimer label={`ends in ${offer.endsIn}`} isUrgent={offer.isUrgent} />
                  </div>

                  {/* Unit Tag Bottom Left */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {offer.unitLabel}
                  </div>

                  {offer.userJoinedQty && (
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="green" size="sm">
                        ✓ You joined (qty {offer.userJoinedQty})
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                      {offer.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {offer.description}
                    </p>
                  </div>

                  {/* Price Row */}
                  <PriceDisplay price={offer.price} mrp={offer.mrp} size="md" />

                  {/* Progress Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {offer.current} of {offer.target} joined
                      </span>
                      {remaining > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {remaining} more needed!
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          100% Target Met
                        </span>
                      )}
                    </div>

                    <ProgressBar
                      current={offer.current}
                      total={offer.target}
                      variant={isFull ? 'emerald' : 'emerald'}
                    />

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{offer.contextMessage}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-5 pt-0">
                <Link to={`/offers/${offer.id}`} className="block">
                  {offer.userJoinedQty ? (
                    <Button variant="secondary" size="md" className="w-full">
                      View / Modify
                    </Button>
                  ) : isFull ? (
                    <Button variant="secondary" size="md" className="w-full">
                      View Summary
                    </Button>
                  ) : isClosed ? (
                    <Button variant="outline" size="md" disabled className="w-full">
                      Offer Closed
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full"
                    >
                      View Offer
                    </Button>
                  )}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Suggest New Bulk Pool Banner */}
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-2xs flex-shrink-0">
            🌾
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Want to propose an item for Indiranagar?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request a wholesale bulk slot for your apartment building or street association.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="whitespace-nowrap">
          Suggest New Bulk Pool
        </Button>
      </div>
    </div>
  );
};

