import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { orders as ordersApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { Order, OrderStatus } from '../types';
import { QueueDisplay } from '../components/QueueDisplay';
import { ChefHat, Clock, Package, CheckCircle } from 'lucide-react';

const nextStatus: Record<string, OrderStatus> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
};

type TimeWindow = 'current' | 'backlog';

interface ItemGroup {
  menuItemId: string;
  name: string;
  category: string;
  totalQuantity: number;
  orders: { tokenNumber: number; quantity: number; time: string; orderId: string }[];
}

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'manage' | 'queue'>('kanban');
  const { socket } = useSocket();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    socket.emit('join:kitchen');

    const handleKitchenUpdate = (order: Order) => {
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

    const handleOrderUpdate = (data: { orderId: string; status: string; order: Order }) => {
      handleKitchenUpdate(data.order);
    };

    socket.on('order:update', handleOrderUpdate);
    socket.on('kitchen:update', handleKitchenUpdate);
    return () => {
      socket.off('order:update', handleOrderUpdate);
      socket.off('kitchen:update', handleKitchenUpdate);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      const activeOrders = await ordersApi.getActive();
      setOrders(activeOrders);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Group items by time window
  const groupItemsByTimeWindow = (window: TimeWindow): ItemGroup[] => {
    const now = new Date();
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const filteredOrders = orders.filter((o) => {
      const orderTime = new Date(o.createdAt);
      if (window === 'current') {
        return orderTime >= fifteenMinAgo;
      }
      return orderTime < fifteenMinAgo;
    });

    // Group by menu item
    const itemMap = new Map<string, ItemGroup>();

    for (const order of filteredOrders) {
      for (const item of order.items) {
        if (!item.menuItem) continue;
        const existing = itemMap.get(item.menuItemId);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.orders.push({
            tokenNumber: order.tokenNumber,
            quantity: item.quantity,
            time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            orderId: order.id,
          });
        } else {
          itemMap.set(item.menuItemId, {
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            category: item.menuItem.category,
            totalQuantity: item.quantity,
            orders: [{
              tokenNumber: order.tokenNumber,
              quantity: item.quantity,
              time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              orderId: order.id,
            }],
          });
        }
      }
    }

    return Array.from(itemMap.values());
  };

  const handleDoneCooking = async (group: ItemGroup) => {
    // Find all orders containing this item and advance their status
    const orderIds = new Set(group.orders.map((o) => o.orderId));
    for (const orderId of orderIds) {
      const order = orders.find((o) => o.id === orderId);
      if (order && nextStatus[order.status]) {
        try {
          await ordersApi.updateStatus(orderId, nextStatus[order.status]!);
        } catch {
          toast.error(`Failed to update order #${order.tokenNumber}`);
        }
      }
    }
    toast.success(`Done cooking ${group.name} (${group.totalQuantity}x)`);
  };

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

  const currentItems = groupItemsByTimeWindow('current');
  const backlogItems = groupItemsByTimeWindow('backlog');
  const currentTokens = new Set(orders.filter((o) => new Date(o.createdAt) >= new Date(Date.now() - 15 * 60 * 1000)).map((o) => o.tokenNumber)).size;
  const backlogTokens = new Set(orders.filter((o) => new Date(o.createdAt) < new Date(Date.now() - 15 * 60 * 1000)).map((o) => o.tokenNumber)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ChefHat className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kitchen Dashboard</h1>
          <p className="text-sm text-slate-500">Live queue status and order management</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'kanban'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ChefHat className="h-4 w-4" />
          KDS Kanban
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'manage'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="h-4 w-4" />
          Active Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'queue'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          Queue
        </button>
      </div>

      {/* KDS Kanban View */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          {/* Current Window */}
          <div className="bg-slate-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">#1</span>
                <div>
                  <h2 className="text-white font-bold text-lg">Current 0 – 5 Min Window</h2>
                  <p className="text-slate-400 text-sm">Recently placed incoming orders</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-700 text-white text-sm font-medium rounded-full">{currentTokens} Token(s)</span>
                <span className="px-3 py-1 bg-amber-600 text-white text-sm font-medium rounded-full">{currentItems.reduce((sum, i) => sum + i.totalQuantity, 0)} Cooking Items</span>
              </div>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No items in current window</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((group) => (
                  <ItemCard key={group.menuItemId} group={group} onDoneCooking={() => handleDoneCooking(group)} />
                ))}
              </div>
            )}
          </div>

          {/* Backlog Window */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 bg-slate-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">#2</span>
                <div>
                  <h2 className="text-white font-bold text-lg">15+ Min Window (Priority / Backlog)</h2>
                  <p className="text-slate-400 text-sm">Orders placed over 15 minutes ago</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-700 text-white text-sm font-medium rounded-full">{backlogTokens} Token(s)</span>
                <span className="px-3 py-1 bg-amber-600 text-white text-sm font-medium rounded-full">{backlogItems.reduce((sum, i) => sum + i.totalQuantity, 0)} Cooking Items</span>
              </div>
            </div>

            {backlogItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No backlog items</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backlogItems.map((group) => (
                  <ItemCard key={group.menuItemId} group={group} onDoneCooking={() => handleDoneCooking(group)} isBacklog />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Orders View */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">No active orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onAdvance={async () => {
                  const next = nextStatus[order.status];
                  if (next) {
                    try {
                      await ordersApi.updateStatus(order.id, next);
                      toast.success(`Order #${order.tokenNumber} → ${next}`);
                    } catch {
                      toast.error('Failed to update status');
                    }
                  }
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Queue View */}
      {activeTab === 'queue' && <QueueDisplay queue={null} />}
    </div>
  );
}

function ItemCard({
  group,
  onDoneCooking,
  isBacklog = false,
}: {
  group: ItemGroup;
  onDoneCooking: () => void;
  isBacklog?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${isBacklog ? 'bg-slate-700' : 'bg-slate-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.category}</p>
          <h3 className="text-white font-bold text-lg">{group.name}</h3>
        </div>
        <span className="px-2.5 py-1 bg-amber-600/20 text-amber-400 text-sm font-bold rounded-lg border border-amber-600/30">
          ORDERED {group.totalQuantity}×
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ORDERED TOKENS & TIMES:</p>
        <div className="flex flex-wrap gap-2">
          {group.orders.map((o, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-600 text-white text-xs font-medium rounded-lg">
              CAN-{o.tokenNumber} {o.quantity > 1 && `${o.quantity}×`} {o.time}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onDoneCooking}
        className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        Done Cooking ({group.totalQuantity}× → Pickup) ✓
      </button>
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance: () => void;
}) {
  const statusColors: Record<Order['status'], string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
    READY: 'bg-green-100 text-green-800 border-green-200',
    PICKED_UP: 'bg-slate-100 text-slate-800 border-slate-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
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
          {order.items.map((item) => `${item.quantity}× ${item.menuItem?.name ?? 'Item'}`).join(', ')}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">₹{order.totalAmount}</span>
        {nextStatus[order.status] && (
          <button
            onClick={onAdvance}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/25"
          >
            {nextStatus[order.status]} →
          </button>
        )}
      </div>
    </div>
  );
}
