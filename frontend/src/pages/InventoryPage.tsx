import { useState, useEffect } from 'react';
import { Search, Package, Minus, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { menu as menuApi } from '../lib/api';
import type { MenuItem } from '../types';

export function InventoryPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await menuApi.getAll();
      setItems(data);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const updateStock = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdating(itemId);
    try {
      await menuApi.update(itemId, { quantityAvailable: newQuantity });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantityAvailable: newQuantity } : item
        )
      );
      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setUpdating(null);
    }
  };

  const adjustStock = (item: MenuItem, delta: number) => {
    const newQty = item.quantityAvailable + delta;
    if (newQty < 0) return;
    updateStock(item.id, newQty);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Package className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Control</h1>
          <p className="text-sm text-slate-500">Manage stock levels and toggle availability in real time.</p>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
        <button
          onClick={loadItems}
          className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{item.category}</p>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                </div>
                <span className="text-lg font-bold text-indigo-600">₹{item.price}</span>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${
                item.quantityAvailable > 10
                  ? 'bg-green-100 text-green-700'
                  : item.quantityAvailable > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {item.quantityAvailable > 0 ? `IN STOCK (${item.quantityAvailable} units left)` : 'OUT OF STOCK'}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Adjust Stock:</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => adjustStock(item, -1)}
                    disabled={updating === item.id || item.quantityAvailable <= 0}
                    className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantityAvailable}</span>
                  <button
                    onClick={() => adjustStock(item, 5)}
                    disabled={updating === item.id}
                    className="h-8 px-3 flex items-center justify-center bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    + 5
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
