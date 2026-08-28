import type { Order } from '../types';

const statusConfig: Record<Order['status'], { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  READY: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-slate-100 text-slate-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const steps: Order['status'][] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'];

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const config = statusConfig[order.status];
  const currentStepIndex = steps.indexOf(order.status);

  const eta = order.estimatedAt ? new Date(order.estimatedAt) : null;
  const isUpcoming = eta && eta > new Date() && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Token</span>
          <span className="text-lg font-bold text-indigo-600">#{order.tokenNumber}</span>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="text-sm text-slate-600 mb-3">
        {order.items.map((item) => `${item.quantity}x ${item.menuItem?.name ?? 'Item'}`).join(', ')}
      </div>

      {order.status !== 'CANCELLED' && order.status !== 'PICKED_UP' && (
        <div className="flex gap-1 mb-3">
          {steps.slice(0, -1).map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${
                i <= currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>₹{order.totalAmount}</span>
          {order.queueEntry && (
            <span className="text-indigo-600 font-medium">
              Q#{order.queueEntry.positionInQueue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isUpcoming && (
            <span className="text-green-600 font-medium">
              ETA {eta!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </button>
  );
}
