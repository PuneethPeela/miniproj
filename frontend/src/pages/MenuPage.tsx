import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { menu as menuApi, orders as ordersApi } from '../lib/api';
import type { MenuItem, CartItem } from '../types';
import { MenuItemCard } from '../components/MenuItemCard';
import { CartDrawer } from '../components/CartDrawer';

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    menuApi.getAll().then(setItems).catch(() => toast.error('Failed to load menu')).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === menuItemId ? { ...c, quantity } : c))
    );
  };

  const removeItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== menuItemId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      await ordersApi.create(cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })));
      toast.success('Order placed!');
      setCart([]);
      setCartOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading menu...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No items found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onPlaceOrder={placeOrder}
        placing={placing}
      />
    </div>
  );
}
