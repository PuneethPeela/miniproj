import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import type { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
            {item.category}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-900">₹{item.price}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {item.prepTime}min
            </span>
          </div>
          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {!item.available && (
          <p className="mt-2 text-xs text-red-500 font-medium">Currently unavailable</p>
        )}
      </div>
    </motion.div>
  );
}
