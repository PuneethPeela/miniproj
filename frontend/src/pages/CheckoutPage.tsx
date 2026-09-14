import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, Banknote, Smartphone, CheckCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { orders as ordersApi } from '../lib/api';
import type { CartItem } from '../types';

// Cart state is passed via navigation state
interface CheckoutState {
  cart: CartItem[];
  total: number;
}

const pickupSlots = [
  { value: 'immediate', label: 'Immediate Kitchen Queue', desc: 'Join the queue now' },
  { value: '15min', label: 'In 15 Minutes', desc: 'Slight delay' },
  { value: '30min', label: 'In 30 Minutes', desc: 'Pre-order for later' },
  { value: '1hr', label: 'In 1 Hour', desc: 'Schedule ahead' },
];

const paymentMethods = [
  { value: 'upi', label: 'Instant UPI', icon: Smartphone, desc: 'Pay via UPI app' },
  { value: 'campus_card', label: 'Campus Card', icon: CreditCard, desc: 'Deduct from campus wallet' },
  { value: 'cash', label: 'Cash Counter', icon: Banknote, desc: 'Pay at pickup counter' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [pickupSlot, setPickupSlot] = useState('immediate');
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(0);

  useEffect(() => {
    // Get cart from navigation state
    const state = history.state as { cart?: CartItem[]; total?: number } | null;
    if (state?.cart && state.cart.length > 0) {
      setCart(state.cart);
      setTotal(state.total || 0);
    } else {
      // No cart data, redirect back to menu
      navigate('/menu', { replace: true });
    }
  }, [navigate]);

  const estimatedTime = cart.reduce((max, item) => {
    const prepTime = Math.round(item.menuItem.avgPrepSeconds / 60);
    return Math.max(max, prepTime * item.quantity);
  }, 5);

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setPlacing(true);
    try {
      const order = await ordersApi.create(
        cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
        { paymentMethod, pickupSlot }
      );
      setTokenNumber(order.tokenNumber);
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-500 mb-4">Your token number is</p>
          <div className="text-5xl font-bold text-indigo-600 mb-6">#{tokenNumber}</div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Payment</span>
              <span className="font-medium text-slate-900 capitalize">{paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Pickup</span>
              <span className="font-medium text-slate-900">
                {pickupSlots.find((s) => s.value === pickupSlot)?.label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-indigo-600">₹{total}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Checkout</p>
              <h2 className="text-white text-xl font-bold">Canteen Checkout</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
          {/* Selected Items */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Selected Items</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.menuItem.name}</p>
                    <p className="text-xs text-slate-500">₹{item.menuItem.price} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">₹{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Estimated Kitchen Time:</span>
            </div>
            <span className="text-sm font-bold text-indigo-700">{estimatedTime} Mins</span>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number</label>
              <input
                type="text"
                value={user?.rollNumber || user?.email?.split('@')[0] || ''}
                readOnly
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 font-mono"
              />
            </div>
          </div>

          {/* Pickup Slot */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Select Pickup Window Slot</label>
            <select
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {pickupSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label} — {slot.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Option</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === method.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-base font-semibold text-slate-900">Total Amount Payable:</span>
            <span className="text-2xl font-bold text-indigo-600">₹{total}</span>
          </div>

          {/* Place Order */}
          <button
            type="submit"
            disabled={placing || cart.length === 0}
            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            {placing ? (
              <>
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Confirm Order & Generate Pickup Token
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
