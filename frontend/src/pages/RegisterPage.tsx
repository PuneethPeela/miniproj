import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, User, Mail, GraduationCap, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'KITCHEN_STAFF'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created!');
      navigate(role === 'STUDENT' ? '/' : '/kitchen');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">SmartCanteen</h1>
              <p className="text-slate-400 text-[10px] tracking-widest uppercase">Campus Dining System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-md">
          {/* Auth Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-2xl px-6 py-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Create Account</p>
                <h2 className="text-white text-xl font-bold">Join Smart Canteen</h2>
              </div>
            </div>
            <p className="text-indigo-200 text-sm">Register to start ordering food or managing the kitchen.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-b-2xl shadow-xl">
            {/* Role Selection */}
            <div className="px-6 pt-5">
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">Select Your Role</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === 'STUDENT'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Student</p>
                    <p className="text-[10px] opacity-60">Order food & track queue</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('KITCHEN_STAFF')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === 'KITCHEN_STAFF'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <ChefHat className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Kitchen Staff</p>
                    <p className="text-[10px] opacity-60">Manage orders & menu</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    placeholder="e.g. Arjun Mehta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {role === 'STUDENT' ? 'Email Address' : 'Staff Email or Official ID'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    placeholder={role === 'STUDENT' ? 'you@college.edu' : 'staff@college.edu'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  `Create ${role === 'STUDENT' ? 'Student' : 'Staff'} Account`
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure Campus Network
              </span>
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
