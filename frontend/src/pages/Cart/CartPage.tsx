import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Store,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  QuantitySelector,
  Button,
  Card,
  Skeleton,
  Alert,
  EmptyState,
} from '../../components/common';
import { cartService } from '../../services/cartService';
import type { Cart, FulfillmentType } from '../../types/cart';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('STORE_PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [isUpdatingFulfillment, setIsUpdatingFulfillment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchCart = async () => {
      try {
        const data = await cartService.getCart();
        if (!ignore) {
          setCart(data);
          if (data.fulfillmentType) {
            setFulfillmentType(data.fulfillmentType);
          }
          if (data.deliveryAddress) {
            setDeliveryAddress(data.deliveryAddress);
          }
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to load shopping cart';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    fetchCart();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await cartService.updateQuantity(itemId, { quantity: newQuantity });
      setCart(updated);
      setSuccessMessage('Cart updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update quantity';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
      setSuccessMessage('Item removed from cart');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove item';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to remove all items from your cart?')) {
      return;
    }
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await cartService.clearCart();
      setCart(updated);
      setSuccessMessage('Cart cleared successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFulfillmentChange = async (type: FulfillmentType, addr?: string) => {
    setIsUpdatingFulfillment(true);
    setError(null);
    try {
      const addressToUse = addr !== undefined ? addr : deliveryAddress;
      const updated = await cartService.updateFulfillment({
        fulfillmentType: type,
        deliveryAddress: addressToUse,
      });
      setCart(updated);
      setFulfillmentType(type);
      setSuccessMessage(
        type === 'STORE_PICKUP'
          ? 'Switched to Free Store / Hub Pickup'
          : 'Switched to Home Delivery (extra fee applied)'
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update fulfillment option';
      setError(msg);
    } finally {
      setIsUpdatingFulfillment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton variant="rectangular" className="h-32 w-full rounded-2xl" />
            <Skeleton variant="rectangular" className="h-32 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton variant="rectangular" className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shopping Cart' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Badge variant="green" size="sm" className="mb-2">
            MADHAPUR BUYING CIRCLE #500081 • HYDERABAD
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
            <span>Community Cart &amp; Pricing</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative group discounts applied directly from active neighbourhood batches.
          </p>
        </div>

        {!isEmpty && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            disabled={isUpdating}
            className="self-start sm:self-auto text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Cart
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Cart Notice" className="animate-in fade-in">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Success" className="animate-in fade-in">
          {successMessage}
        </Alert>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="Your shopping cart is empty"
          description="Explore active community pool offers to buy pantry staples at direct-from-mill wholesale prices."
          actionLabel="Browse Active Offers"
          onAction={() => navigate('/')}
          className="my-8"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>
                {cart.itemCount} {cart.itemCount === 1 ? 'Product' : 'Products'} ({cart.totalItems}{' '}
                {cart.totalItems === 1 ? 'unit' : 'units'})
              </span>
              <span>Hub Pickup: {cart.deliveryNote}</span>
            </div>

            {cart.items.map((item) => (
              <Card
                key={item.id}
                padding="md"
                className="relative overflow-hidden border border-slate-200/90 dark:border-slate-800 transition hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'}
                      alt={item.productName}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                      >
                        {item.productName}
                      </Link>
                      <Badge variant="gray" size="sm">
                        {item.unitLabel}
                      </Badge>
                    </div>

                    {/* Group Status Pill */}
                    <div>
                      {item.isGroupPriceApplied ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800">
                          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            Bulk Volume Tier • Save {item.savingsPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Retail Price (Add 5+ units for bulk wholesale discount)
                        </span>
                      )}
                    </div>

                    {/* Pricing Unit Row */}
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        ₹{item.appliedUnitPrice.toLocaleString('en-IN')}
                      </span>
                      {item.isGroupPriceApplied && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                          MRP ₹{item.mrpUnitPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        per {item.unitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
                        Item Subtotal
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-emerald-800 dark:text-emerald-400">
                        ₹{item.itemSubtotal.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <QuantitySelector
                        value={item.quantity}
                        min={1}
                        max={item.maxAllowedQuantity}
                        onChange={(newQty) => handleUpdateQuantity(item.id, newQty)}
                        size="sm"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Remove item"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                      Max {item.maxAllowedQuantity} units/order
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            {/* Back to Shopping button */}
            <div className="pt-2">
              <Link to="/">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Continue Shopping &amp; Explore Offers
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Pricing Ledger & Fulfillment Selector */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            {/* Fulfillment Selector Card */}
            <Card padding="md" className="border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fulfillment Method
                </span>
                <Badge variant={fulfillmentType === 'STORE_PICKUP' ? 'green' : 'blue'} size="sm">
                  {fulfillmentType === 'STORE_PICKUP' ? 'Free Pickup' : 'Home Delivery'}
                </Badge>
              </div>

              {/* Options Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange('STORE_PICKUP')}
                  disabled={isUpdatingFulfillment}
                  className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                    fulfillmentType === 'STORE_PICKUP'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Store Pickup</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                    FREE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFulfillmentChange('HOME_DELIVERY')}
                  disabled={isUpdatingFulfillment}
                  className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                    fulfillmentType === 'HOME_DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Home Delivery</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Qty &amp; Weight Surcharge
                  </span>
                </button>
              </div>

              {/* Home Delivery Address Input */}
              {fulfillmentType === 'HOME_DELIVERY' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
                  <label htmlFor="delivery-address-input" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Delivery Address:
                  </label>
                  <input
                    id="delivery-address-input"
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Flat / house, street, landmark, city"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleFulfillmentChange('HOME_DELIVERY', deliveryAddress)}
                    disabled={isUpdatingFulfillment || !deliveryAddress.trim()}
                  >
                    Save Delivery Address
                  </Button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {fulfillmentType === 'STORE_PICKUP'
                  ? 'Pickup directly from Madhapur Community Hub at no additional cost.'
                  : 'Delivered directly to your doorstep. Logistics fee calculated by item quantity and weight.'}
              </p>
            </Card>

            <Card
              padding="lg"
              className="border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Price Details
                </h2>
                <Badge variant="blue" size="sm">
                  {cart.totalItems} {cart.totalItems === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>

              {/* Ledger Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Catalog MRP Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    ₹{cart.mrpSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Volume Wholesale Discount (4%–20%):</span>
                  </span>
                  <span className="font-bold">
                    - ₹{cart.applicableDiscounts.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    {fulfillmentType === 'STORE_PICKUP' ? 'Store Pickup Fee:' : 'Home Delivery Surcharge:'}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                      Estimated Total Payable:
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Inclusive of all co-op &amp; mandi taxes
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    ₹{cart.finalEstimatedTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Savings Highlight Pill */}
              {cart.estimatedSavings > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Neighbourhood Pooling Benefit</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    You save <strong>₹{cart.estimatedSavings.toLocaleString('en-IN')}</strong> by ordering together with your circle instead of individual retail pricing!
                  </p>
                </div>
              )}

              {/* Milestone Assurance Info */}
              <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  Zero upfront payment today. You will receive a direct UPI payment link once collective batches confirm.
                </span>
              </div>

              {/* Action Button */}
              <Link to="/orders" className="block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-sm sm:text-base font-bold py-3.5 shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View Buying Circle Orders
                </Button>
              </Link>
            </Card>

            {/* Quality & Direct Sourcing Assurance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Direct Mandi &amp; Mill Guarantee
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lab-tested purity with zero middleman markups. Handover verified by cluster coordinators.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
