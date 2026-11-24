import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Clock,
  BadgeCheck,
  ShieldCheck,
  Check,
  Building2,
  ShoppingCart,
  Users,
  Truck,
  MapPin,
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
import { cartService } from '../../services/cartService';
import { batchService } from '../../services/batchService';
import { useAuth } from '../../features/auth/useAuth';
import type { ProductDetail } from '../../types/product';
import type { BatchResponse, BatchParticipant } from '../../types/batch';

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeBatch, setActiveBatch] = useState<BatchResponse | null>(null);
  const [participants, setParticipants] = useState<BatchParticipant[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [pledgeQty, setPledgeQty] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const [isPledging, setIsPledging] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);
  const [pledgeError, setPledgeError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const prodData = await productService.getProductById(id);
        if (!isMounted) return;
        setProduct(prodData);
        setSelectedImage(prodData.imageUrl);

        // Fetch active batch
        const batchData = await batchService.getActiveBatchByProductId(prodData.id);
        if (!isMounted) return;
        setActiveBatch(batchData);

        if (batchData) {
          const parts = await batchService.getParticipants(batchData.id);
          if (isMounted) setParticipants(parts);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Product not found';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!product) return;
    setIsAddingToCart(true);
    setCartError(null);
    try {
      await cartService.addToCart({ productId: product.id, quantity: pledgeQty });
      setCartSuccess(`Added ${pledgeQty} ${product.unitLabel} to your cart!`);
      setTimeout(() => setCartSuccess(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add item to cart';
      setCartError(msg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleOpenPledgeModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setPledgeError(null);
    setIsModalOpen(true);
  };

  const handleConfirmPledge = async () => {
    if (!activeBatch) {
      setPledgeError('No active batch is currently open for this product.');
      return;
    }
    setIsPledging(true);
    setPledgeError(null);
    try {
      await batchService.joinBatch(activeBatch.id, {
        quantity: pledgeQty,
        phone: user?.phone || '',
        displayName: user?.fullName || 'Neighbour',
      });
      setPledgeSuccess(`Pledge confirmed! You have reserved ${pledgeQty} ${product.unitLabel}.`);
      setIsModalOpen(false);

      // Refresh live batch progress and participants
      const refreshedBatch = await batchService.getBatchById(activeBatch.id);
      setActiveBatch(refreshedBatch);
      const refreshedParts = await batchService.getParticipants(activeBatch.id);
      setParticipants(refreshedParts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reserve pledge. Please try again.';
      setPledgeError(msg);
    } finally {
      setIsPledging(false);
    }
  };

  const getVolumeDiscountPercent = (qty: number): number => {
    if (qty < 5) return 0;
    const pct = 4.0 + (qty - 5) * 0.8;
    return Math.min(20, Math.max(4, pct));
  };

  const discountPercent = getVolumeDiscountPercent(pledgeQty);
  const effectivePrice = discountPercent > 0
    ? Math.round(product.mrp * (1 - discountPercent / 100))
    : product.mrp;
  const effectiveMrp = product.mrp;
  const totalPrice = effectivePrice * pledgeQty;
  const totalSavings = (effectiveMrp - effectivePrice) * pledgeQty;
  const unitKg = product.unitWeightKg || 1;
  const perKgPrice = (effectivePrice / Number(unitKg)).toFixed(2);

  const targetQty = activeBatch?.targetQuantity ?? 25;
  const currentQty = activeBatch?.currentQuantity ?? 0;
  const progressPct = activeBatch?.progressPercent ?? (targetQty > 0 ? Math.min(100, Math.round((currentQty / targetQty) * 100)) : 0);
  const remainingQty = activeBatch?.remainingQuantity ?? Math.max(0, targetQty - currentQty);
  const maxAllowedQuantity = 25;

  // Combined gallery images
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
            { label: activeBatch?.clusterName || 'Madhapur Cluster, Hyderabad', href: '/' },
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
          <span>{activeBatch?.clusterName || 'Madhapur Central, Hyderabad'} Cluster Pool</span>
          <span>•</span>
          <span>Lead Organiser: <strong>{activeBatch?.leadOrganiser || 'Coordinator Ananya S. (Cyber Towers Hub)'}</strong></span>
        </div>
        <div className="text-slate-600 dark:text-slate-400">
          Hub Drop: <strong>{activeBatch?.hubDropLocation || 'Madhapur Community Hub – Gate 1 (Near Cyber Towers)'}</strong>
        </div>
      </div>

      {/* Success Notification Alert */}
      {pledgeSuccess && (
        <Alert variant="success" onDismiss={() => setPledgeSuccess(null)}>
          {pledgeSuccess}
        </Alert>
      )}

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery, Co-op Profile & Community Pulse */}
        <div className="lg:col-span-7 space-y-6">
          <Card padding="none" className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="relative h-96 bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedImage || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={activeBatch?.status === 'CONFIRMED' ? 'blue' : 'green'} size="md">
                  {activeBatch?.status === 'CONFIRMED' ? 'BATCH CONFIRMED' : 'OPEN FOR PLEDGES'}
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

          {/* Local Community Pulse - Recent Neighbours (Screen 3 UI) */}
          {participants.length > 0 && (
            <Card padding="md" className="space-y-4 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Local Community Pulse
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Recent neighbours who joined this batch
                    </h4>
                  </div>
                </div>
                <Badge variant="green" size="sm">
                  {activeBatch?.totalParticipants || participants.length} Households Participating
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {participants.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {p.initials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {p.displayName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
                          {p.quantity} {p.quantity === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {p.location ? `${p.location} • ` : ''}{p.timeAgo || 'recently'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
                ✓ Direct procurement eliminates intermediate middlemen. 100% of wholesale proceeds go directly to the cooperative pool account.
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Wholesale Collective Offer
                </span>
                {activeBatch && (
                  <Badge variant="blue" size="sm">
                    Batch #{activeBatch.batchCode}
                  </Badge>
                )}
              </div>
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

            {/* Dynamic Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentQty} of {targetQty} joined
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">{progressPct}% target met</span>
              </div>

              <ProgressBar current={currentQty} total={targetQty} variant="emerald" />

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {remainingQty > 0
                    ? `⚡ Almost there! Just ${remainingQty} more needed`
                    : '🎉 Milestone unlocked! Ready for confirmation'}
                </span>
                <span>Wholesale Quota: {targetQty} Units</span>
              </div>
            </div>

            {/* Delivery Schedule & Hub Pickup Timings */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Order &amp; Delivery Schedule</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Estimated Hub Delivery</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Thursday, 4:00 PM – 7:00 PM</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Pickup Collection Window</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Thu 5:00 PM – 9:00 PM &amp; Fri 9 AM – 1 PM</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{activeBatch?.hubDropLocation || 'Madhapur Community Hub – Gate 1, Near Cyber Towers, Hyderabad'}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Select Quantity:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    5–25 units unlock volume wholesale discounts
                  </span>
                </div>
                <QuantitySelector
                  value={pledgeQty}
                  onChange={setPledgeQty}
                  min={1}
                  max={maxAllowedQuantity}
                  unit={product.unitLabel.includes('bag') ? 'bag' : 'unit'}
                />
              </div>

              {/* Dynamic Volume Tier Badge */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Volume Tier:
                  </span>
                  {discountPercent > 0 ? (
                    <Badge variant="green" size="sm">
                      {discountPercent.toFixed(1)}% Bulk Discount
                    </Badge>
                  ) : (
                    <Badge variant="gray" size="sm">
                      Retail Pricing (0% off)
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pledgeQty < 5
                    ? `Add ${5 - pledgeQty} more units to unlock wholesale bulk discounts (4%–20% off).`
                    : `You save ₹${totalSavings.toLocaleString('en-IN')} with bulk quantity pricing!`}
                </p>
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

              {/* Delivery Assurance */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Store Pickup at Community Hub</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-5">
                  Optional home delivery available at checkout (extra fee based on quantity &amp; weight).
                </p>
              </div>

              {/* Cart Notification Alerts */}
              {cartError && (
                <Alert variant="error" className="text-xs" onDismiss={() => setCartError(null)}>
                  {cartError}
                </Alert>
              )}
              {cartSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {cartSuccess}
                  </span>
                  <Link to="/cart">
                    <Button variant="primary" size="sm" className="text-xs">
                      View Cart &amp; Checkout →
                    </Button>
                  </Link>
                </div>
              )}

              {/* Action Buttons: Add to Cart and Pledge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-sm font-bold py-3.5 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  leftIcon={<ShoppingCart className="w-4 h-4" />}
                  disabled={isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm font-bold py-3.5"
                  onClick={handleOpenPledgeModal}
                >
                  Pledge Units →
                </Button>
              </div>

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
          {pledgeError && (
            <Alert variant="error" className="text-xs">
              {pledgeError}
            </Alert>
          )}

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
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isPledging}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPledging}
              onClick={handleConfirmPledge}
            >
              {isPledging ? 'Reserving...' : 'Confirm Reservation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
