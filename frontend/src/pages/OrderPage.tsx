import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageCheck, XCircle, Clock } from 'lucide-react';
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
  PENDING: 'text-yellow-600',
  CONFIRMED: 'text-blue-600',
  PREPARING: 'text-orange-600',
  READY: 'text-green-600',
  PICKED_UP: 'text-slate-600',
  CANCELLED: 'text-red-600',
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
    const handleUpdate = (updated: Order) => {
      if (updated.id === id) setOrder(updated);
    };
    socket.on('order:update', handleUpdate);
    return () => { socket.off('order:update', handleUpdate); };
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

  if (loading) return <div className="text-center py-12 text-slate-500">Loading order...</div>;
  if (!order) return <div className="text-center py-12 text-slate-500">Order not found</div>;

  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
  const eta = order.estimatedAt ? new Date(order.estimatedAt) : null;
  const isUpcoming = eta && eta > new Date();

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-500">Token Number</p>
            <p className="text-3xl font-bold text-indigo-600">#{order.tokenNumber}</p>
          </div>
          <span className={`text-lg font-semibold ${statusColors[order.status]}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {order.status !== 'CANCELLED' && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {statusSteps.map((step, i) => (
                <div key={step.key} className="flex-1">
                  <div className={`h-2 rounded-full ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                  <p className={`text-xs mt-1 text-center ${i <= currentIndex ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUpcoming && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Estimated ready by <strong>{eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-600">
                {item.quantity}x {item.menuItem?.name ?? 'Item'}
              </span>
              <span className="text-slate-900 font-medium">₹{(item.menuItem?.price ?? 0) * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {order.status === 'READY' && (
            <button
              onClick={handlePickUp}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <PackageCheck className="h-4 w-4" />
              {actionLoading ? 'Processing...' : 'Mark as Picked Up'}
            </button>
          )}
          {order.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {actionLoading ? 'Processing...' : 'Cancel Order'}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Ordered at {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
