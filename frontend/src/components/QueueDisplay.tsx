import { Users, Clock, Hash, ListOrdered } from 'lucide-react';
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

  const entries = queue.entries ?? [];
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

      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      {entries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListOrdered className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Live Queue</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {entries.map((e) => (
              <div
                key={e.tokenNumber}
                className="flex items-center justify-between text-sm py-1.5 px-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600">#{e.tokenNumber}</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    e.stage === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                    e.stage === 'IN_KITCHEN' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {e.stage === 'WAITING' ? 'Waiting' :
                     e.stage === 'IN_KITCHEN' ? 'In Kitchen' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Q#{e.position}</span>
                  {e.estimatedReadyAt && (
                    <span className="text-xs text-green-600 font-medium">
                      {new Date(e.estimatedReadyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
