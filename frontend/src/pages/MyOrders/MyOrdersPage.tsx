import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Share2,
  Trash2,
  Edit2,
  ArrowRight,
  TrendingUp,
  Package,
  Weight,
  MessageSquare,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Breadcrumb,
  Badge,
  PriceDisplay,
  Button,
  Card,
  Skeleton,
  EmptyState,
  Alert,
} from '../../components/common';
import { batchService } from '../../services/batchService';
import { orderService } from '../../services/orderService';
import { CancelOrderModal } from '../../components/orders/CancelOrderModal';
import { useAuth } from '../../features/auth/useAuth';
import type { BatchParticipant } from '../../types/batch';
import type { Order } from '../../types/order';

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'active' | 'completed' | 'cancelled'>('orders');
  const [pledges, setPledges] = useState<BatchParticipant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(() => isAuthenticated);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [pledgeData, orderData] = await Promise.all([
        batchService.getMyPledges().catch(() => []),
        orderService.getUserOrders().catch(() => []),
      ]);
      setPledges(pledgeData);
      setOrders(orderData);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve your orders';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPledges = loadData;

  useEffect(() => {
    let ignore = false;
    if (!isAuthenticated) return;

    const fetchPledges = async () => {
      try {
        const [pledgeData, orderData] = await Promise.all([
          batchService.getMyPledges().catch(() => []),
          orderService.getUserOrders().catch(() => []),
        ]);
        if (!ignore) {
          setPledges(pledgeData);
          setOrders(orderData);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve your pledges and orders';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchPledges();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const handleCancelPledge = async (participantId: number) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this pledge? Your reserved wholesale quota will be released back to the circle.'
      )
    ) {
      return;
    }

    setActionLoadingId(participantId);
    try {
      await batchService.cancelPledge(participantId);
      await loadPledges();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel pledge';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleModifyQuantity = async (pledge: BatchParticipant) => {
    const input = window.prompt(
      `Update pledge quantity for ${pledge.productName || 'this batch'} (current: ${pledge.quantity}):`,
      String(pledge.quantity)
    );
    if (input === null) return;

    const newQty = parseInt(input.trim(), 10);
    if (isNaN(newQty) || newQty <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    setActionLoadingId(pledge.id);
    try {
      await batchService.updatePledgeQuantity(pledge.id, newQty);
      await loadPledges();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update pledge quantity';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Classify pledges into tabs
  const activePledges = pledges.filter(
    (p) => p.status === 'ACTIVE' || p.status === 'PAYMENT_PENDING'
  );
  const completedPledges = pledges.filter((p) => p.status === 'PAID');
  const cancelledPledges = pledges.filter(
    (p) => p.status === 'CANCELLED' || p.status === 'RELEASED'
  );

  const displayedPledges =
    activeTab === 'active'
      ? activePledges
      : activeTab === 'completed'
      ? completedPledges
      : cancelledPledges;

  // Derived metrics for lifetime dashboard
  const pledgeSavings = pledges
    .filter((p) => p.status !== 'CANCELLED' && p.status !== 'RELEASED')
    .reduce((sum, p) => sum + (p.savings ? Number(p.savings) : 0), 0);

  const orderSavings = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const lifetimeSavings = pledgeSavings + orderSavings;

  const activeItemsCount = activePledges.length + orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'DELIVERED').length;
  const totalQuantityPledged = pledges
    .filter((p) => p.status !== 'CANCELLED')
    .reduce((sum, p) => sum + (p.quantity || 0), 0) +
    orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + (item.quantity || 0), 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'My Orders' }]} />
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="Sign in to view your orders &amp; pledges"
          description="Log in to monitor community batch milestone quotas, view payment links, and manage your reserved portions."
          actionLabel="Sign In to Your Account"
          onAction={() => navigate('/login')}
          className="my-8"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'My Orders' }]} />

      {/* Header and Cluster Lifetime Savings Widget */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <Badge variant="green" size="sm" className="mb-2">
            MADHAPUR BUYING CIRCLE #500081 • HYDERABAD
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Neighbourhood Orders &amp; Pledges
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Track group milestone progress, payment links, and pickup schedules for your community buying collective. Pay only when your circle hits target wholesale volume.
          </p>
        </div>

        {/* Lifetime Savings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-6">
          <div className="pr-6 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Lifetime Savings
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              ₹{lifetimeSavings.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              {completedPledges.length} Batches Completed
            </div>
          </div>

          <div className="pr-6 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Active
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {activeItemsCount} {activeItemsCount === 1 ? 'Batch' : 'Batches'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Weight className="w-3.5 h-3.5 text-amber-600" />
              Total Units
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalQuantityPledged}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Direct Orders (Volume Pricing)</span>
          <span className="w-4 h-4 rounded-full bg-emerald-700 dark:bg-emerald-800 text-[10px] font-bold text-white flex items-center justify-center">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Active Pledges</span>
          <span className="w-4 h-4 rounded-full bg-emerald-700 dark:bg-emerald-800 text-[10px] font-bold text-white flex items-center justify-center">
            {activePledges.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Completed &amp; Delivered</span>
          <span className="text-[10px] text-slate-400 font-semibold">{completedPledges.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'cancelled'
              ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>Closed &amp; Cancelled</span>
          <span className="text-[10px] text-slate-400 font-semibold">{cancelledPledges.length}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Notice"
          onDismiss={() => setError(null)}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                loadPledges();
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton variant="rectangular" className="h-44 w-full rounded-2xl" />
          <Skeleton variant="rectangular" className="h-44 w-full rounded-2xl" />
        </div>
      )}

      {/* Direct Orders Tab Content */}
      {activeTab === 'orders' && !isLoading && orders.length === 0 && (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="No direct volume orders yet"
          description="Build a cart with 5–25 units of pantry staples to unlock automatic volume discounts and free community hub delivery!"
          actionLabel="Browse Products & Offers"
          onAction={() => navigate('/')}
        />
      )}

      {activeTab === 'orders' && !isLoading && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              padding="none"
              className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xs transition"
            >
              <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    ORDER #{order.orderNumber}
                  </Badge>
                  <Badge variant={order.fulfillmentType === 'STORE_PICKUP' ? 'green' : 'blue'} size="sm">
                    {order.fulfillmentType === 'STORE_PICKUP' ? 'Free Hub Pickup' : 'Home Delivery'}
                  </Badge>
                  <span className="text-slate-500 text-[11px]">
                    Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
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
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {order.status === 'CANCELLED' && (
                  <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Order Cancelled &amp; Refunded</span>
                      </span>
                      {order.cancelledAt && (
                        <span className="font-normal text-[11px] opacity-80">
                          {new Date(order.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-[11px]">
                      <span>
                        Net Refund: <strong>₹{(order.refundAmount !== undefined ? order.refundAmount : order.finalTotal).toLocaleString('en-IN')}</strong>
                      </span>
                      {order.cancellationFee !== undefined && order.cancellationFee > 0 && (
                        <span>
                          Late Fee: <strong>₹{order.cancellationFee.toFixed(2)}</strong>
                        </span>
                      )}
                      {order.cancellationReason && (
                        <span className="truncate">
                          Reason: <em>{order.cancellationReason}</em>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="text-slate-400 ml-2">
                          (₹{item.appliedUnitPrice} / {item.unitLabel || 'unit'})
                        </span>
                        {item.savingsPercent > 0 && (
                          <span className="ml-2 text-emerald-600 font-semibold text-[11px]">
                            {item.savingsPercent}% Bulk Discount
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        ₹{item.itemSubtotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {order.fulfillmentType === 'HOME_DELIVERY' && order.deliveryAddress && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <strong>Delivery Address:</strong> {order.deliveryAddress} (Surcharge: ₹{order.deliveryFee})
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs space-y-0.5">
                    <div className="text-slate-500">
                      Total Payable: <strong className="text-base text-slate-900 dark:text-white ml-1">₹{order.finalTotal.toLocaleString('en-IN')}</strong>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="text-emerald-600 font-semibold text-[11px]">
                        Saved ₹{order.discountAmount.toLocaleString('en-IN')} with tiered bulk pricing!
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancellingOrder(order)}
                        className="text-rose-600 hover:text-rose-700 hover:border-rose-300 dark:text-rose-400 dark:hover:border-rose-800"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Cancel Order
                      </Button>
                    )}

                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View Order &amp; Handover Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeTab !== 'orders' && !isLoading && displayedPledges.length === 0 && (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title={
            activeTab === 'active'
              ? 'No active pledges'
              : activeTab === 'completed'
              ? 'No completed batches yet'
              : 'No cancelled pledges'
          }
          description={
            activeTab === 'active'
              ? 'You have not joined any community wholesale batches yet. Reserve items with zero upfront payment today!'
              : activeTab === 'completed'
              ? 'Delivered and fulfilled group buys will show up here.'
              : 'Pledges you cancel or release will appear in this archive.'
          }
          actionLabel="Browse Active Offers"
          onAction={() => navigate('/')}
        />
      )}

      {/* Pledges List */}
      {activeTab !== 'orders' && !isLoading && displayedPledges.length > 0 && (
        <div className="space-y-6">
          {displayedPledges.map((pledge) => {
            const isPaymentPending = pledge.status === 'PAYMENT_PENDING';
            const isPaid = pledge.status === 'PAID';
            const isCancelled = pledge.status === 'CANCELLED' || pledge.status === 'RELEASED';
            const mrpEach =
              pledge.unitPrice +
              (pledge.savings && pledge.quantity > 0 ? Number(pledge.savings) / pledge.quantity : 0);

            return (
              <Card
                key={pledge.id}
                padding="none"
                className={`overflow-hidden border ${
                  isPaymentPending
                    ? 'border-2 border-amber-300 dark:border-amber-700'
                    : isPaid
                    ? 'border-emerald-200 dark:border-emerald-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Payment Urgent Top Bar */}
                {isPaymentPending && (
                  <div className="bg-amber-600 text-white px-5 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Batch Quota Full! Payment Window Open</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-700/80 px-2.5 py-0.5 rounded-full font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pay window active</span>
                    </div>
                  </div>
                )}

                {/* Paid Fulfilled Top Bar */}
                {isPaid && (
                  <div className="bg-emerald-700 text-white px-5 py-2 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Confirmed &amp; Dispatched to Madhapur Hub, Hyderabad</span>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        <img
                          src={
                            pledge.productImageUrl ||
                            'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={pledge.productName || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="blue" size="sm">
                            Batch #{pledge.batchCode || pledge.groupPurchaseId}
                          </Badge>
                          {isPaymentPending ? (
                            <Badge variant="green" size="sm">
                              Quota Unlocked
                            </Badge>
                          ) : isPaid ? (
                            <Badge variant="green" size="sm">
                              Paid
                            </Badge>
                          ) : isCancelled ? (
                            <Badge variant="gray" size="sm">
                              Cancelled
                            </Badge>
                          ) : (
                            <Badge variant="green" size="sm">
                              Pledges Open
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {pledge.productName || 'Neighbourhood Group Deal'}
                        </h3>

                        <div className="flex items-center gap-2 mt-2">
                          <PriceDisplay
                            price={pledge.unitPrice}
                            mrp={mrpEach > pledge.unitPrice ? mrpEach : undefined}
                            size="sm"
                          />
                          <span className="text-xs text-slate-400">
                            ({pledge.quantity} {pledge.unitLabel || 'units'} × ₹{pledge.unitPrice})
                          </span>
                        </div>

                        {pledge.savings > 0 && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                            Saving ₹{Number(pledge.savings).toFixed(0)} vs retail MRP
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hub Pickup Info */}
                    <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Hub Delivery &amp; Pickup</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Madhapur Community Hub – Gate 1
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Delivery: Thursday, 4:00 PM – 7:00 PM
                      </div>
                      <div className="text-slate-500">
                        Pickup Hours: Thu 5 PM – 9 PM &amp; Fri 9 AM – 1 PM
                      </div>
                      <div className="text-slate-500">Hub Lead: Coordinator Ananya S. (Cyber Towers Hub)</div>
                    </div>
                  </div>

                  {/* Order & Delivery Timings Progression Bar */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Order Lifecycle &amp; Delivery Timeline</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Expected Collective Drop: <strong>Thursday, 4:00 PM</strong>
                      </div>
                    </div>

                    {/* 4-Step Milestone Progression */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                        <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">1. Pledged</div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">₹0 Reserved</div>
                        <div className="text-[10px] text-emerald-600">Active Spot</div>
                      </div>

                      <div className={`p-2 rounded-lg border ${
                        isPaymentPending || isPaid
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}>
                        <div className="text-[10px] font-bold uppercase">2. Quota Lock</div>
                        <div className="text-xs font-semibold mt-0.5">
                          {isPaymentPending || isPaid ? 'Quota Met' : 'In Progress'}
                        </div>
                        <div className="text-[10px]">Payment Open</div>
                      </div>

                      <div className={`p-2 rounded-lg border ${
                        isPaid
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}>
                        <div className="text-[10px] font-bold uppercase">3. Mill Dispatch</div>
                        <div className="text-xs font-semibold mt-0.5">Wednesday</div>
                        <div className="text-[10px]">Direct Freight</div>
                      </div>

                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500">
                        <div className="text-[10px] font-bold uppercase">4. Hub Pickup</div>
                        <div className="text-xs font-semibold mt-0.5">Thursday 4 PM</div>
                        <div className="text-[10px]">Digital QR Pass</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment pending guidance */}
                  {isPaymentPending && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="font-bold">Group target unlocked! Direct UPI payment is now open.</div>
                      <p>
                        Please complete payment of <strong>₹{pledge.totalAmount.toLocaleString('en-IN')}</strong> to confirm collective dispatch. Zero platform or delivery surcharges.
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">
                      Commitment ID: {pledge.commitmentCode}
                    </span>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      {!isCancelled && !isPaid && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === pledge.id}
                            onClick={() => handleCancelPledge(pledge.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Leave Group / Cancel</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === pledge.id}
                            onClick={() => handleModifyQuantity(pledge)}
                            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 font-semibold flex items-center gap-1 disabled:opacity-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Modify Qty ({pledge.quantity})</span>
                          </button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.origin);
                          alert('Pledge link copied to clipboard!');
                        }}
                      >
                        Share
                      </Button>

                      {isPaymentPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                          className="bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => {
                            alert(
                              `Simulating UPI payment request for ₹${pledge.totalAmount} to Madhapur Buying Circle, Hyderabad.`
                            );
                          }}
                        >
                          Pay ₹{pledge.totalAmount.toLocaleString('en-IN')} via UPI →
                        </Button>
                      )}

                      <Link to={`/offers/${pledge.groupPurchaseId}`}>
                        <Button variant="outline" size="sm">
                          Batch Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* WhatsApp Community Desk CTA */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <strong>Have questions about your Madhapur, Hyderabad delivery slot?</strong>
          <div className="text-slate-500 dark:text-slate-400">
            Coordinator Ananya or our WhatsApp buying desk is here to help.
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}>
          WhatsApp Community Desk
        </Button>
      </div>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <CancelOrderModal
          isOpen={Boolean(cancellingOrder)}
          onClose={() => setCancellingOrder(null)}
          order={cancellingOrder}
          onSuccess={(updatedOrder) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
            );
          }}
        />
      )}
    </div>
  );
};
