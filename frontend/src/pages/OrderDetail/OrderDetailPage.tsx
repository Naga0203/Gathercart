import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Truck,
  Store,
  CheckCircle2,
  Package,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  Button,
  Card,
  Alert,
} from '../../components/common';
import { orderService } from '../../services/orderService';
import { CancelOrderModal } from '../../components/orders/CancelOrderModal';
import type { Order } from '../../types/order';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [utrNumber, setUtrNumber] = useState('429810239410');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!id) return;

    if (/^\d+$/.test(id)) {
      orderService
        .getOrderById(id)
        .then((data) => {
          if (!ignore) {
            setOrder(data);
            setOrderError(null);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            const msg = err instanceof Error ? err.message : 'Unable to load order details';
            setOrderError(msg);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [id]);

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

  // If a real order is loaded from API
  if (order) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Breadcrumb
            items={[
              { label: 'My Orders', href: '/orders' },
              { label: `Order #${order.orderNumber}` },
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

        {/* Order Header Card */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  order.status === 'PLACED'
                    ? 'green'
                    : order.status === 'CONFIRMED'
                    ? 'blue'
                    : order.status === 'CANCELLED'
                    ? 'red'
                    : 'gray'
                }
                size="sm"
              >
                ORDER {order.status}
              </Badge>
              <Badge variant={order.fulfillmentType === 'STORE_PICKUP' ? 'green' : 'blue'} size="sm">
                {order.fulfillmentType === 'STORE_PICKUP' ? 'Free Hub Pickup' : 'Home Delivery'}
              </Badge>
              <span className="text-[11px] text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {order.fulfillmentType === 'STORE_PICKUP'
                ? 'Ready for pickup at Madhapur Community Hub – Gate 1 (Near Cyber Towers, Hyderabad).'
                : `Doorstep delivery scheduled to ${order.deliveryAddress || 'your address'}.`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 self-stretch sm:self-auto">
            <div className="text-right flex-shrink-0 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Amount</div>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono">
                ₹{order.finalTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold">
                Saved ₹{order.discountAmount.toLocaleString('en-IN')} with bulk wholesale discount
              </div>
            </div>

            {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-rose-600 hover:text-rose-700 hover:border-rose-300 dark:text-rose-400 w-full sm:w-auto"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Cancellation Alert Banner */}
        {order.status === 'CANCELLED' && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-5 space-y-2.5 text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Order Cancelled &amp; Refund Initiated</span>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              This order was cancelled on{' '}
              {order.cancelledAt
                ? new Date(order.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : 'file'}
              . Reason: <span className="font-semibold italic">"{order.cancellationReason || 'Customer requested cancellation'}"</span>
            </p>
            <div className="pt-2 border-t border-rose-200/80 dark:border-rose-800/80 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span>Order Total Paid: ₹{order.finalTotal.toLocaleString('en-IN')}</span>
              <span>
                Cancellation Fee:{' '}
                {order.cancellationFee && order.cancellationFee > 0
                  ? `₹${order.cancellationFee.toFixed(2)}`
                  : '₹0.00 (Free)'}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                Net Refund: ₹{(order.refundAmount !== undefined ? order.refundAmount : order.finalTotal).toLocaleString('en-IN')}
              </span>
              <span className="text-slate-500 text-[11px] font-normal">
                Payment Status: {order.paymentStatus || 'REFUNDED'}
              </span>
            </div>
          </div>
        )}

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List & Fulfillment Node */}
          <div className="lg:col-span-8 space-y-6">
            <Card padding="md" className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Ordered Items ({order.items.length})</span>
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-start gap-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </h4>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{item.itemSubtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.quantity} {item.unitLabel || 'units'} × ₹{item.appliedUnitPrice.toLocaleString('en-IN')}
                        {item.mrpUnitPrice > item.appliedUnitPrice && (
                          <span className="line-through text-slate-400 ml-1.5">
                            ₹{item.mrpUnitPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {item.savingsPercent > 0 && (
                        <div className="mt-1">
                          <Badge variant="green" size="sm">
                            {item.savingsPercent}% Bulk Discount Applied • Save ₹{item.savingsAmount.toLocaleString('en-IN')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Fulfillment Details */}
            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                {order.fulfillmentType === 'STORE_PICKUP' ? (
                  <Store className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Truck className="w-4 h-4 text-blue-600" />
                )}
                <span>Fulfillment &amp; Handover</span>
              </h3>

              {order.fulfillmentType === 'STORE_PICKUP' ? (
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Madhapur Community Hub – Gate 1 (Hyderabad)
                  </div>
                  <div>Near Cyber Towers Main Gate, Madhapur, Hyderabad – 500081</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Pickup Window: Thursday 4:00 PM – 7:00 PM (100% Free Store Pickup)
                  </div>
                </div>
              ) : (
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Home Delivery Address:
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {order.deliveryAddress || 'Address on file'}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 font-medium pt-1">
                    Logistics Surcharge: ₹{order.deliveryFee.toLocaleString('en-IN')} (based on weight and quantity)
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Ledger & Payment Instructions */}
          <div className="lg:col-span-4 space-y-6">
            <Card padding="md" className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Price Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Catalog MRP Total:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    ₹{order.mrpSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Volume Bulk Discount:</span>
                  </span>
                  <span className="font-bold">
                    - ₹{order.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    {order.fulfillmentType === 'STORE_PICKUP' ? 'Store Pickup Fee:' : 'Delivery Surcharge:'}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-bold text-sm text-slate-900 dark:text-white">
                  <span>{order.status === 'CANCELLED' ? 'Order Total:' : 'Total Payable:'}</span>
                  <span className="text-lg font-black">
                    ₹{order.finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {order.status === 'CANCELLED' && (
                  <>
                    <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                      <span>Cancellation Fee:</span>
                      <span className="font-semibold">
                        {order.cancellationFee && order.cancellationFee > 0
                          ? `- ₹${order.cancellationFee.toFixed(2)}`
                          : '₹0.00 (Free)'}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-bold text-sm text-emerald-700 dark:text-emerald-400">
                      <span>Net Refund:</span>
                      <span className="text-lg font-black font-mono">
                        ₹{(order.refundAmount !== undefined ? order.refundAmount : order.finalTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* UPI Payment Instructions */}
            <Card padding="md" className="space-y-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Payment &amp; Settlement
                </h4>
              </div>

              {order.status === 'CANCELLED' ? (
                <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="font-bold text-rose-700 dark:text-rose-400">
                    Status: {order.paymentStatus || 'REFUNDED'}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Refund of ₹{(order.refundAmount !== undefined ? order.refundAmount : order.finalTotal).toLocaleString('en-IN')} has been authorized to your original payment channel.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Zero advance money charged today. Pay securely via UPI when collecting at the hub or at doorstep delivery.
                  </p>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      coop.saurashtra@okhdfcbank
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy VPA'}
                    </button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {isCancelModalOpen && (
          <CancelOrderModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            order={order}
            onSuccess={(updatedOrder) => {
              setOrder(updatedOrder);
            }}
          />
        )}
      </div>
    );
  }

  // Fallback: Legacy batch commitment lifecycle view
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {orderError && (
        <Alert variant="error" onDismiss={() => setOrderError(null)}>
          {orderError}
        </Alert>
      )}

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
          <span>Batch #HYD-398</span>
          <span>•</span>
          <span>Madhapur Hub 01 • Hyderabad</span>
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
        {/* Left Column: Lifecycle, Item, Hub Lead */}
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
                  15 of 15 orders confirmed by Madhapur Cluster! Bulk producer discount unlocked.
                </p>
              </div>

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
                  Consolidated crate arrives at Madhapur Community Hub – Gate 1. Pick up with QR token.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Payment Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Payment Transfer
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transfer via Google Pay / PhonePe / Paytm:
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
                <span>coop.saurashtra@okhdfcbank</span>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="utr-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Enter 12-Digit UPI Reference (UTR):
              </label>
              <input
                id="utr-input"
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 429810239410"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={isVerifying}
                onClick={handleVerify}
              >
                {isVerifying ? 'Verifying...' : 'Submit UTR & Get Pickup Pass'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
