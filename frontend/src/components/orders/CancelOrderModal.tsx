import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal, Button, Alert } from '../common';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/order';

export interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess: (updated: Order) => void;
}

const PRESET_REASONS = [
  'Ordered items by mistake',
  'Found a better deal / alternate product',
  'Delivery or pickup schedule does not suit',
  'Need to change delivery address',
  'Other',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  const orderCreatedTime = order.createdAt ? new Date(order.createdAt).getTime() : nowMs;
  const elapsedMinutes = Math.max(0, Math.floor((nowMs - orderCreatedTime) / (1000 * 60)));
  const isFreeWindow = elapsedMinutes <= 120;

  const fee = isFreeWindow ? 0 : Math.min(50, order.finalTotal);
  const refundAmount = Math.max(0, order.finalTotal - fee);

  const formatElapsed = (mins: number) => {
    if (mins < 60) {
      return `${mins} min${mins === 1 ? '' : 's'} ago`;
    }
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0
      ? `${hrs} hr ${remainingMins} mins ago`
      : `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  };

  const handleConfirmCancel = async () => {
    const finalReason =
      selectedReason === 'Other'
        ? (customReason.trim() || 'Customer requested cancellation')
        : selectedReason;

    try {
      setIsLoading(true);
      setError(null);
      const updatedOrder = await orderService.cancelOrder(order.id, { reason: finalReason });
      onSuccess(updatedOrder);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <span>Cancel Order #{order.orderNumber}</span>
        </div>
      }
      subtitle="Review the cancellation policy and refund breakdown below."
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" title="Cancellation Failed">
            {error}
          </Alert>
        )}

        {/* Policy Window Indicator */}
        <div
          className={`p-3.5 rounded-2xl border ${
            isFreeWindow
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isFreeWindow ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>{isFreeWindow ? 'Free Cancellation Window Active' : 'Late Cancellation Fee Applied'}</span>
                <span className="font-normal text-[11px] opacity-80 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {formatElapsed(elapsedMinutes)}
                </span>
              </div>
              <p className="opacity-90 leading-relaxed text-[11px]">
                {isFreeWindow
                  ? 'Orders cancelled within 2 hours of placement qualify for 100% full refund with zero cancellation charges.'
                  : 'This order was placed over 2 hours ago. A flat late cancellation fee of ₹50.00 applies to cover packing and warehouse allocation costs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Refund & Fee Ledger Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Refund Summary
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Order Total Paid</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              ₹{order.finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Cancellation Fee</span>
            <span
              className={`font-semibold ${
                fee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {fee > 0 ? `-₹${fee.toFixed(2)}` : '₹0.00 (Free)'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-900 dark:text-white">Net Refund Amount</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400 text-base font-mono">
              ₹{refundAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-0.5">
            Refund will be processed back to original payment mode ({order.paymentMethod || 'UPI'}).
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-700 dark:text-slate-200">
            Reason for Cancellation
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            {PRESET_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {selectedReason === 'Other' && (
            <input
              type="text"
              placeholder="Please specify your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={200}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500 mt-2"
            />
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Keep Order
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmCancel}
            isLoading={isLoading}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
