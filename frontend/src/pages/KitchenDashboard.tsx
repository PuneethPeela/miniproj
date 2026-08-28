import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { orders as ordersApi, queue as queueApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { Order, QueueStatus, OrderStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { ChevronRight } from 'lucide-react';

const nextStatus: Record<string, OrderStatus> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
};

const statusColors: Record<Order['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  PICKED_UP: 'bg-slate-100 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const loadData = async () => {
    try {
      const [activeOrders, queueStatus] = await Promise.all([
        ordersApi.getActive(),
        queueApi.getStatus(),
      ]);
      setOrders(activeOrders);
      setQueue(queueStatus);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleOrderUpdate = (order: Order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === order.id);
        if (order.status === 'PICKED_UP' || order.status === 'CANCELLED') {
          return prev.filter((o) => o.id !== order.id);
        }
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = order;
          return updated;
        }
        return [order, ...prev];
      });
    };
    const handleKitchenUpdate = (data: Order) => {
      handleOrderUpdate(data);
    };
    const handleQueueUpdate = (status: QueueStatus) => {
      setQueue(status);
    };

    socket.on('order:update', handleOrderUpdate);
    socket.on('kitchen:update', handleKitchenUpdate);
    socket.on('queue:update', handleQueueUpdate);
    return () => {
      socket.off('order:update', handleOrderUpdate);
      socket.off('kitchen:update', handleKitchenUpdate);
      socket.off('queue:update', handleQueueUpdate);
    };
  }, [socket]);

  const advanceStatus = async (order: Order) => {
    const next = nextStatus[order.status];
    if (!next) return;
    try {
      await ordersApi.updateStatus(order.id, next);
      toast.success(`Order #${order.tokenNumber} → ${next}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <QueueDisplay queue={queue} />

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Active Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No active orders</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-indigo-600">#{order.tokenNumber}</span>
                    <span className="text-sm text-slate-500">{order.user?.name}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-slate-600 mb-3">
                  {order.items.map((item) => `${item.quantity}x ${item.menuItem?.name ?? 'Item'}`).join(', ')}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">₹{order.totalAmount}</span>
                  {nextStatus[order.status] && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {nextStatus[order.status]}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
