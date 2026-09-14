import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageCheck, XCircle, Clock, Hash, Check, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { orders as ordersApi } from '../lib/api';
import type { Order, OrderItem } from '../types';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

const statusSteps: { key: string; label: string }[] = [
  { key: 'cooking', label: 'Cooking' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'collected', label: 'Collected' },
];

const statusColors: Record<Order['status'], string> = {
  PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  CONFIRMED: 'text-blue-600 bg-blue-50 border-blue-200',
  PREPARING: 'text-orange-600 bg-orange-50 border-orange-200',
  READY: 'text-green-600 bg-green-50 border-green-200',
  PICKED_UP: 'text-slate-600 bg-slate-50 border-slate-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
};

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    ordersApi.getById(id).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    socket.emit('join:order', id);
    const handleUpdate = (data: { orderId: string; status: string; order: Order }) => {
      if (data.orderId === id) setOrder(data.order);
    };
    socket.on('order:update', handleUpdate);
    return () => {
      socket.off('order:update', handleUpdate);
      socket.emit('leave:order', id);
    };
  }, [id, socket]);

  const handleCollectItem = async (orderItemId: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await ordersApi.collectItem(id, orderItemId);
      setOrder(updated);
      toast.success('Item marked as collected!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to collect item');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickUp = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await ordersApi.pickUp(id);
      toast.success('Order picked up!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pick up order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-1/4 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <PackageCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Order not found</p>
        <button onClick={() => navigate('/')} className="mt-3 text-sm text-indigo-600 hover:underline">
          Back to Menu
        </button>
      </div>
    );
  }

  // Calculate progress based on item collection
  const totalItems = order.items.length;
  const collectedItems = order.items.filter((item) => item.collected).length;
  const readyItems = order.items.length; // All items are ready when order status is READY
  const cookingItems = order.status === 'READY' || order.status === 'PICKED_UP' ? 0 : totalItems;

  // Determine current step
  let currentStep = 0;
  if (order.status === 'READY' && collectedItems === 0) currentStep = 1;
  else if (order.status === 'READY' && collectedItems > 0 && collectedItems < totalItems) currentStep = 1;
  else if (collectedItems === totalItems || order.status === 'PICKED_UP') currentStep = 2;
  else if (order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING') currentStep = 0;

  const eta = order.estimatedAt ? new Date(order.estimatedAt) : null;
  const isUpcoming = eta && eta > new Date();
  const canCollect = order.status === 'READY' && user?.id === order.userId;

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Token</p>
              <p className="text-3xl font-bold text-white">#{order.tokenNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[order.status]}`}>
                {order.status.replace('_', ' ')}
              </span>
              {order.user && (
                <p className="text-sm text-indigo-200 mt-2">
                  {order.user.name} ({order.user.rollNumber || order.user.email?.split('@')[0]})
                </p>
              )}
              {order.queueEntry && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
                <p className="text-xs text-indigo-200 flex items-center justify-end gap-1 mt-1">
                  <Hash className="h-3 w-3" /> Queue #{order.queueEntry.positionInQueue}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* All Items Ready Banner */}
          {order.status === 'READY' && collectedItems < totalItems && (
            <div className="mb-5 flex items-center gap-3 text-sm bg-green-50 text-green-700 rounded-xl p-4 border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="font-medium">ALL ITEMS READY FOR PICKUP!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Show Token #{order.tokenNumber} at Counter #1
                </p>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          {order.status !== 'CANCELLED' && (
            <div className="mb-6">
              <div className="flex items-center gap-2">
                {statusSteps.map((step, i) => (
                  <div key={step.key} className="flex-1">
                    <div className={`h-2.5 rounded-full transition-all duration-300 ${
                      i <= currentStep ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                    <p className={`text-xs mt-1.5 text-center font-medium ${
                      i <= currentStep ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {step.label} {step.key === 'cooking' && `(${cookingItems} items)`}
                      {step.key === 'ready' && `(${readyItems - collectedItems} ready)`}
                      {step.key === 'collected' && `(${collectedItems}/${totalItems})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ETA */}
          {isUpcoming && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
            <div className="mb-5 flex items-center gap-3 text-sm bg-indigo-50 text-indigo-700 rounded-xl p-4 border border-indigo-100">
              <Clock className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="font-medium">
                  Estimated ready by{' '}
                  <strong>{eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                ORDERED ITEMS ({totalItems}):
              </h3>
              {order.status === 'READY' && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {totalItems - collectedItems} Ready for Pickup
                </span>
              )}
            </div>

            {canCollect && (
              <p className="text-xs text-slate-500 mb-3">
                Click the checkbox for pickup ready items to collect & dim them
              </p>
            )}

            <div className="space-y-3">
              {order.items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  canCollect={canCollect}
                  onCollect={() => handleCollectItem(item.id)}
                  loading={actionLoading}
                />
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-base mt-4 pt-3 border-t border-slate-200">
              <span>Total {order.paymentMethod === 'upi' ? 'Paid (UPI):' : order.paymentMethod === 'campus_card' ? 'Paid (Campus Card):' : 'Pay at Counter:'}</span>
              <span className="text-indigo-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Collect All Button */}
          {canCollect && collectedItems < totalItems && (
            <div className="mt-6">
              <button
                onClick={() => {
                  // Collect all uncollected items
                  order.items
                    .filter((item) => !item.collected)
                    .forEach((item) => handleCollectItem(item.id));
                }}
                disabled={actionLoading}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                I Have Collected My Entire Order (#{order.tokenNumber})
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {order.status === 'READY' && collectedItems === totalItems && (
              <button
                onClick={handlePickUp}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg shadow-green-600/25"
              >
                <PackageCheck className="h-5 w-5" />
                {actionLoading ? 'Processing...' : 'Mark as Picked Up'}
              </button>
            )}
            {order.status === 'PENDING' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/25"
              >
                <XCircle className="h-5 w-5" />
                {actionLoading ? 'Processing...' : 'Cancel Order'}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Ordered at {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderItemRow({
  item,
  canCollect,
  onCollect,
  loading,
}: {
  item: OrderItem;
  canCollect: boolean;
  onCollect: () => void;
  loading: boolean;
}) {
  const isCollected = item.collected;
  const isReady = !isCollected; // If order is READY, all items are ready

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        isCollected
          ? 'bg-slate-50 border-slate-200 opacity-50'
          : isReady
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Checkbox */}
      {canCollect && !isCollected && (
        <button
          onClick={onCollect}
          disabled={loading}
          className="h-6 w-6 rounded border-2 border-green-400 flex items-center justify-center hover:bg-green-100 transition-colors shrink-0"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
      )}
      {isCollected && (
        <div className="h-6 w-6 rounded bg-green-500 flex items-center justify-center shrink-0">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isCollected ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {item.quantity}x {item.menuItem?.name ?? 'Item'}
        </p>
        {isReady && !isCollected && (
          <p className="text-xs text-green-600 mt-0.5">Ready for Pickup • Tap checkbox or click Collect below</p>
        )}
        {isCollected && (
          <p className="text-xs text-green-600 mt-0.5">✓ Collected</p>
        )}
      </div>

      {/* Price & Action */}
      <div className="flex items-center gap-3 shrink-0">
        {isReady && !isCollected && canCollect && (
          <button
            onClick={onCollect}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ✓ Mark Collected
          </button>
        )}
        <span className={`text-sm font-bold ${isCollected ? 'text-slate-400' : 'text-slate-900'}`}>
          ₹{(item.menuItem?.price ?? 0) * item.quantity}
        </span>
      </div>
    </div>
  );
}
