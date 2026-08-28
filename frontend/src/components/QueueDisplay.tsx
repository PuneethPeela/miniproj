import { Users, Clock, Hash, ListOrdered, Activity } from 'lucide-react';
import type { QueueStatus } from '../types';

interface QueueDisplayProps {
  queue: QueueStatus | null;
}

export function QueueDisplay({ queue }: QueueDisplayProps) {
  if (!queue) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const entries = queue.entries ?? [];
  const progress = queue.activeOrders > 0
    ? ((queue.currentToken - queue.activeOrders) / queue.currentToken) * 100
    : 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-900">Queue Status</h3>
        <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
          <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <Hash className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
          <p className="text-2xl font-bold text-slate-900">{queue.currentToken}</p>
          <p className="text-xs text-slate-500 font-medium">Current Token</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold text-slate-900">{queue.estimatedWait}m</p>
          <p className="text-xs text-slate-500 font-medium">Est. Wait</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold text-slate-900">{queue.activeOrders}</p>
          <p className="text-xs text-slate-500 font-medium">Active</p>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      {entries.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Live Queue</span>
            <span className="text-xs text-slate-400 ml-auto">{entries.length} in queue</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.map((e) => (
              <div
                key={e.tokenNumber}
                className="flex items-center justify-between text-sm py-2.5 px-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-indigo-600">#{e.tokenNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    e.stage === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                    e.stage === 'IN_KITCHEN' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {e.stage === 'WAITING' ? 'Waiting' :
                     e.stage === 'IN_KITCHEN' ? 'In Kitchen' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Q#{e.position}</span>
                  {e.estimatedReadyAt && (
                    <span className="text-xs text-green-600 font-semibold">
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
