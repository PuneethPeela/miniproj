import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageCheck, XCircle, Clock, Hash, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { orders as ordersApi } from '../lib/api';
import type { Order } from '../types';
import { useSocket } from '../hooks/useSocket';

const statusSteps: { key: Order['status']; label: string }[] = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'PICKED_UP', label: 'Picked Up' },
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
        <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Order not found</p>
        <button onClick={() => navigate('/')} className="mt-3 text-sm text-indigo-600 hover:underline">
          Back to Menu
        </button>
      </div>
    );
  }

  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
  const eta = order.estimatedAt ? new Date(order.estimatedAt) : null;
  const isUpcoming = eta && eta > new Date();

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
              <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Token Number</p>
              <p className="text-3xl font-bold text-white">#{order.tokenNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[order.status]}`}>
                {order.status.replace('_', ' ')}
              </span>
              {order.queueEntry && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
                <p className="text-sm text-indigo-200 flex items-center justify-end gap-1 mt-2">
                  <Hash className="h-3 w-3" /> Queue #{order.queueEntry.positionInQueue}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          {order.status !== 'CANCELLED' && (
            <div className="mb-6">
              <div className="flex items-center gap-2">
                {statusSteps.map((step, i) => (
                  <div key={step.key} className="flex-1">
                    <div className={`h-2.5 rounded-full transition-all duration-300 ${
                      i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                    }`} />
                    <p className={`text-xs mt-1.5 text-center font-medium ${
                      i <= currentIndex ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      {step.label}
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
                <p className="font-medium">Estimated ready by <strong>{eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>
                {order.queueEntry?.estimatedReadyAt && (
                  <p className="text-xs text-indigo-500 mt-0.5">
                    Queue position: {order.queueEntry.positionInQueue}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Order Summary</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.quantity}x {item.menuItem?.name ?? 'Item'}
                </span>
                <span className="text-slate-900 font-medium">₹{(item.menuItem?.price ?? 0) * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-indigo-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {order.status === 'READY' && (
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
