import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orders as ordersApi, queue as queueApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import type { Order, QueueStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { OrderCard } from '../components/OrderCard';

export function QueuePage() {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <QueueDisplay queue={queue} />

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">My Orders</h2>
        {myOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => (
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
