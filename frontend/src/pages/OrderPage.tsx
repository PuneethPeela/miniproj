import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orders as ordersApi } from '../lib/api';
import { useState } from 'react';
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

  if (loading) return <div className="text-center py-12 text-slate-500">Loading order...</div>;
  if (!order) return <div className="text-center py-12 text-slate-500">Order not found</div>;

  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);

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

        <p className="text-xs text-slate-400 mt-4 text-center">
          Ordered at {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
