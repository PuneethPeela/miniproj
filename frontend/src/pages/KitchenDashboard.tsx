import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { orders as ordersApi, queue as queueApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { Order, QueueStatus, OrderStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { ChefHat, ChevronRight, Clock, Package } from 'lucide-react';

const nextStatus: Record<string, OrderStatus> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
};

const statusColors: Record<Order['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
  READY: 'bg-green-100 text-green-800 border-green-200',
  PICKED_UP: 'bg-slate-100 text-slate-800 border-slate-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusFilters: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
];

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
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

  const filtered = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ChefHat className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kitchen Dashboard</h1>
          <p className="text-sm text-slate-500">Live queue status and order management</p>
        </div>
      </div>

      <QueueDisplay queue={queue} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Active Orders</h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{orders.length} total</span>
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
              {orders.length === 0 ? 'No active orders' : 'No orders match this filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600">#{order.tokenNumber}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.user?.name}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700 font-medium">
                    {order.items.map((item) => `${item.quantity}x ${item.menuItem?.name ?? 'Item'}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-900">₹{order.totalAmount}</span>
                    {order.estimatedAt && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        ETA {new Date(order.estimatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {nextStatus[order.status] && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/25"
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
