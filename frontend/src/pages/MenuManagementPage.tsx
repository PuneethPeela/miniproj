import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Clock, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { menu as menuApi } from '../lib/api';
import type { MenuItem } from '../types';

const CATEGORIES = ['Rice Bowl', 'Snacks', 'Drinks', 'Desserts', 'Combo'];

interface FormData {
  name: string;
  description: string;
  price: number;
  category: string;
  prepTime: number;
  imageUrl: string;
}

const emptyForm: FormData = {
  name: '',
  description: '',
  price: 0,
  category: CATEGORIES[0],
  prepTime: 5,
  imageUrl: '',
};

export function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const loadItems = async () => {
    try {
      const data = await menuApi.getAll();
      setItems(data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const categories = ['All', ...CATEGORIES];

  const filtered = items.filter(
    (item) => filter === 'All' || item.category === filter
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      prepTime: item.prepTime,
      imageUrl: item.imageUrl || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0) {
      toast.error('Name and valid price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: form.price,
        category: form.category,
        prepTime: form.prepTime,
        imageUrl: form.imageUrl || undefined,
      };
      if (editingId) {
        await menuApi.update(editingId, payload);
        toast.success('Item updated');
      } else {
        await menuApi.create(payload);
        toast.success('Item added');
      }
      closeForm();
      loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from menu?`)) return;
    try {
      await menuApi.delete(id);
      toast.success('Item removed');
      loadItems();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuApi.update(item.id, { available: !item.available });
      toast.success(item.available ? 'Item hidden' : 'Item restored');
      loadItems();
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Menu Management</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No items found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full shrink-0">
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 truncate mt-0.5">{item.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="font-bold text-slate-900">₹{item.price}</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3" /> {item.prepTime}min
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    item.available
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {item.available ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Item' : 'Add Item'}
              </h2>
              <button onClick={closeForm} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Chicken Biryani"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Short description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={form.prepTime}
                    onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeForm}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
