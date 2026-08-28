import { Users, Clock, Hash } from 'lucide-react';
import type { QueueStatus } from '../types';

interface QueueDisplayProps {
  queue: QueueStatus | null;
}

export function QueueDisplay({ queue }: QueueDisplayProps) {
  if (!queue) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        Loading queue status...
      </div>
    );
  }

  const progress = queue.activeOrders > 0
    ? ((queue.currentToken - queue.activeOrders) / queue.currentToken) * 100
    : 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Queue Status</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <Hash className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-2xl font-bold text-slate-900">{queue.currentToken}</p>
          <p className="text-xs text-slate-500">Current Token</p>
        </div>
        <div className="text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold text-slate-900">{queue.estimatedWait}m</p>
          <p className="text-xs text-slate-500">Est. Wait</p>
        </div>
        <div className="text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold text-slate-900">{queue.activeOrders}</p>
          <p className="text-xs text-slate-500">Active</p>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
