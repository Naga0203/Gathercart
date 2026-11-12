import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Clock,
  BadgeCheck,
  ShieldCheck,
  Check,
  Building2,
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
  Skeleton,
  Alert,
} from '../../components/common';
import { productService } from '../../services/productService';
import type { ProductDetail } from '../../types/product';

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [pledgeQty, setPledgeQty] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        setSelectedImage(data.imageUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Product not found';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton variant="rectangular" className="h-96 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-48 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton variant="rectangular" className="h-72 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4">
        <Alert variant="error" title="Product Unavailable">
          {error || 'The requested product could not be found.'}
        </Alert>
        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Active Offers
          </Button>
        </Link>
      </div>
    );
  }

  const effectivePrice = product.groupPrice;
  const effectiveMrp = product.mrp;
  const totalPrice = effectivePrice * pledgeQty;
  const unitKg = product.unitWeightKg || 1;
  const perKgPrice = (effectivePrice / Number(unitKg)).toFixed(2);

  // Gallery images combined: primary + additional
  const allImages = [
    product.imageUrl,
    ...(product.images ? product.images.map((img) => img.imageUrl) : []),
  ].filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Pool Bar & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Breadcrumb
          items={[
            { label: 'Indiranagar Cluster', href: '/' },
            { label: product.categoryName || 'Products', href: '/' },
            { label: product.name },
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
          <Card padding="none" className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="relative h-96 bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedImage || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="green" size="md">
                  OPEN FOR PLEDGES
                </Badge>
                {product.isPesticideTested && (
                  <Badge variant="outline-green" size="md" icon={<BadgeCheck className="w-4 h-4 text-emerald-600" />}>
                    Pesticide Residue Tested
                  </Badge>
                )}
                {product.isLabVerified && (
                  <Badge variant="blue" size="md">
                    Lab Verified
                  </Badge>
                )}
              </div>

              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-lg">
                Direct Mill Sourced • Verified Fresh Stock
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition ${
                        selectedImage === imgUrl
                          ? 'border-2 border-emerald-600 shadow-xs'
                          : 'border border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {allImages.length} verified photos
                </span>
              </div>
            )}
          </Card>

          {/* Mill & Farmer Co-op Profile */}
          {product.coopProfile && (
            <Card padding="md" className="space-y-4 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Mill &amp; Farmer Co-op Profile
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {product.coopProfile.name}
                    </h3>
                    <p className="text-xs text-slate-500">{product.coopProfile.location}</p>
                  </div>
                </div>
                <Badge variant="blue" size="sm">
                  Co-op ID: {product.coopProfile.coopIdCode}
                </Badge>
              </div>

              {/* Quality Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Harvest Date</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {product.harvestDate || 'Fresh Batch'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Verified Batch</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Moisture Level</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {product.moistureLevel || 'Standard'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Optimal Cook</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Variety / Grade</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {product.grainType || 'Premium'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Aromatic &amp; Pure</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Processing</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {product.processing || 'Zero Wax'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Cold Sorted</div>
                </div>
              </div>

              {product.coopProfile.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.coopProfile.description}
                </p>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 leading-relaxed">
                ✓ Direct procurement eliminates 3 intermediate middlemen (distributors, city commission agents, and retail kirana markups). 100% of proceeds go directly to the cooperative pool account.
              </p>
            </Card>
          )}

          {/* Specifications & Quality Notes */}
          {(product.detailedDescription || product.culinaryProfile || product.qualityMetrics) && (
            <Card padding="md" className="space-y-4 border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                🌾 Product Specifications &amp; Quality Notes
              </h4>

              {product.detailedDescription && (
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Authenticity &amp; Origin
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.detailedDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {product.culinaryProfile && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-wider">
                      Culinary Profile
                    </div>
                    <pre className="text-xs text-slate-600 dark:text-slate-400 font-sans whitespace-pre-line leading-relaxed">
                      {product.culinaryProfile}
                    </pre>
                  </div>
                )}

                {product.qualityMetrics && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-wider">
                      Batch Quality Metrics
                    </div>
                    <pre className="text-xs text-slate-600 dark:text-slate-400 font-sans whitespace-pre-line leading-relaxed">
                      {product.qualityMetrics}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Guarantee Section */}
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                GatherCart Guarantee: Zero Upfront Payment, Zero Risk
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Cancel anytime prior to the milestone target lock.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Zero auto-debits if the quota is not met.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Official UPI settlement link only when the mill dispatches.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Quality inspected at community hub before handover.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Pledge Box */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="lg" className="space-y-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Wholesale Collective Offer
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {product.unitLabel} • {product.description}
              </p>
            </div>

            {/* Authoritative Price Display */}
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <PriceDisplay
                price={effectivePrice}
                mrp={effectiveMrp}
                size="lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>₹{perKgPrice} / unit equivalent</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Free Community Hub Drop
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  23 of 25 joined
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">92% target met</span>
              </div>

              <ProgressBar current={23} total={25} variant="emerald" />

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ⚡ Almost there! Just 2 more needed
                </span>
                <span>Wholesale Quota: 25 Units</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Units to Pledge:
                </span>
                <QuantitySelector
                  value={pledgeQty}
                  onChange={setPledgeQty}
                  min={1}
                  max={3}
                  unit={product.unitLabel.includes('bag') ? 'bag' : 'unit'}
                />
              </div>

              {/* Order Calculation Preview */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Calculation ({pledgeQty} × ₹{effectivePrice}):
                </span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ₹{totalPrice.toLocaleString('en-IN')} total
                </span>
              </div>

              {/* Pledge Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base py-3.5"
                onClick={() => setIsModalOpen(true)}
              >
                Pledge {pledgeQty} {pledgeQty === 1 ? 'Unit' : 'Units'} (₹0 Upfront) →
              </Button>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>No money collected now. Pay only via UPI once batch hits 100%.</span>
              </div>
            </div>

            {/* Share link */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Product link copied to clipboard!');
                }}
              >
                Share with Neighbours to Unlock Quota
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Confirm Pledge for ${product.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are reserving <strong>{pledgeQty} {product.unitLabel}</strong> at direct mill wholesale price of{' '}
            <strong>₹{effectivePrice}</strong> each (MRP ₹{effectiveMrp}).
          </p>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Total Payable at Milestone:</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Your Savings:</span>
              <span>₹{((effectiveMrp - effectivePrice) * pledgeQty).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Upfront Payment Due Today:</span>
              <span>₹0.00</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            You will receive a notification when the quota is reached with instructions for community hub collection.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert(`Pledge of ${pledgeQty} units confirmed! (In Phase 4 this will persist pledges to the database).`);
                setIsModalOpen(false);
              }}
            >
              Confirm Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
