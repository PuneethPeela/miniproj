import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orders as ordersApi, queue as queueApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import type { Order, QueueStatus, OrderStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { OrderCard } from '../components/OrderCard';
import { ClipboardList, Package } from 'lucide-react';

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
        setMyOrders((prev) => {
          const idx = prev.findIndex((o) => o.id === order.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = order;
            return updated;
          }
          return [order, ...prev];
        });
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-500">Track your orders and queue position in real time.</p>
        </div>
      </div>

      <QueueDisplay queue={queue} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Order History</h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{myOrders.length} total</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                statusFilter === f.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">
              {myOrders.length === 0 ? 'No orders yet — place your first order!' : 'No orders match this filter'}
            </p>
          </div>
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
