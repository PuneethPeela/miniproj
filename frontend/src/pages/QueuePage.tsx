import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orders as ordersApi, queue as queueApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import type { Order, QueueStatus, OrderStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { OrderCard } from '../components/OrderCard';

const statusFilters: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'PICKED_UP', label: 'Picked Up' },
];

export function QueuePage() {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [orders, queueStatus] = await Promise.all([
        ordersApi.getAll(),
        queueApi.getStatus(),
      ]);
      setMyOrders(orders.filter((o) => o.userId === user?.id));
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
      if (order.userId === user?.id) {
        setMyOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      }
    };
    const handleQueueUpdate = (status: QueueStatus) => {
      setQueue(status);
    };

    socket.on('order:update', handleOrderUpdate);
    socket.on('queue:update', handleQueueUpdate);
    return () => {
      socket.off('order:update', handleOrderUpdate);
      socket.off('queue:update', handleQueueUpdate);
    };
  }, [socket, user]);

  const filtered = statusFilter === 'ALL'
    ? myOrders
    : myOrders.filter((o) => o.status === statusFilter);

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <QueueDisplay queue={queue} />

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">My Orders</h2>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                statusFilter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            {myOrders.length === 0 ? 'No orders yet' : 'No orders match this filter'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
