import type { Order } from '../types';
import { Clock, Hash } from 'lucide-react';

const statusConfig: Record<Order['status'], { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PREPARING: { label: 'Preparing', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  READY: { label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
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
      className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">#{order.tokenNumber}</span>
          </div>
          <div>
            <p className="text-xs text-slate-500">Token</p>
            <p className="text-sm font-semibold text-slate-900">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg px-3 py-2">
        {order.items.map((item) => `${item.quantity}x ${item.menuItem?.name ?? 'Item'}`).join(', ')}
      </div>

      {order.status !== 'CANCELLED' && order.status !== 'PICKED_UP' && (
        <div className="flex gap-1 mb-3">
          {steps.slice(0, -1).map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
          {order.queueEntry && (
            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
              <Hash className="h-3 w-3" />
              Q#{order.queueEntry.positionInQueue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isUpcoming && (
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <Clock className="h-3 w-3" />
              ETA {eta!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </button>
  );
}
