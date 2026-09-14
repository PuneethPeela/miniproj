import { useState, useEffect } from 'react';
import { Search, DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { menu as menuApi } from '../lib/api';
import type { MenuItem } from '../types';

export function PriceManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await menuApi.getAll();
      setItems(data);
    } catch {
      toast.error('Failed to load menu items');
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

  const updatePrice = async (itemId: string, newPrice: number) => {
    if (newPrice <= 0) return;
    setUpdating(itemId);
    try {
      await menuApi.update(itemId, { price: newPrice });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, price: newPrice } : item
        )
      );
      toast.success('Price updated');
    } catch {
      toast.error('Failed to update price');
    } finally {
      setUpdating(null);
    }
  };

  const adjustPrice = (item: MenuItem, delta: number) => {
    const newPrice = Math.max(1, item.price + delta);
    updatePrice(item.id, newPrice);
  };

  const setCustomPrice = (itemId: string) => {
    const priceStr = customPrices[itemId];
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid price');
      return;
    }
    updatePrice(itemId, price);
    setCustomPrices((prev) => ({ ...prev, [itemId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Price Management</h1>
          <p className="text-sm text-slate-500">Adjust menu item prices in real time.</p>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search food item to change rate"
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{item.category}</p>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Current Rate</p>
                  <span className="text-xl font-bold text-indigo-600">₹{item.price}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Prep time: ~{Math.round(item.avgPrepSeconds / 60)}min • Stock: {item.quantityAvailable}
              </p>

              {/* Price Adjuster */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Live Price Adjuster:</span>
                  <span className="text-xs text-slate-400">Step ±₹5 / ±₹1</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  <button
                    onClick={() => adjustPrice(item, -5)}
                    disabled={updating === item.id}
                    className="py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    -₹5
                  </button>
                  <button
                    onClick={() => adjustPrice(item, -1)}
                    disabled={updating === item.id}
                    className="py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    -₹1
                  </button>
                  <button
                    onClick={() => adjustPrice(item, 1)}
                    disabled={updating === item.id}
                    className="py-2 text-sm font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    +₹1
                  </button>
                  <button
                    onClick={() => adjustPrice(item, 5)}
                    disabled={updating === item.id}
                    className="py-2 text-sm font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    +₹5
                  </button>
                </div>

                {/* Custom Price */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customPrices[item.id] || ''}
                      onChange={(e) =>
                        setCustomPrices((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={String(item.price)}
                      min="1"
                    />
                  </div>
                  <button
                    onClick={() => setCustomPrice(item.id)}
                    disabled={updating === item.id || !customPrices[item.id]}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Set
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
