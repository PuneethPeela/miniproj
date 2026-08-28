import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onPlaceOrder: () => void;
  placing: boolean;
}

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  placing,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center gap-3 bg-slate-50 rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.menuItem.name}
                        </p>
                        <p className="text-xs text-slate-500">₹{item.menuItem.price} each</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            item.quantity === 1
                              ? onRemoveItem(item.menuItem.id)
                              : onUpdateQuantity(item.menuItem.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Total</span>
                  <span className="text-lg font-bold text-slate-900">₹{total}</span>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={placing}
                  className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
