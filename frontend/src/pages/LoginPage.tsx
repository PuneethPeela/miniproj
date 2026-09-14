import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, User, ChefHat, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

type Tab = 'student' | 'staff' | 'manager';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
        });

        const container = document.getElementById('google-signin-btn');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleCallback = async (response: { credential: string }) => {
    setGoogleLoading(true);
    try {
      const result = await googleLogin(response.credential);
      if (result.isNewUser || !result.profileComplete) {
        toast.success('Welcome! Please complete your profile.');
        navigate('/complete-profile');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const credentials = tab === 'manager' ? { field: email, extra: pin } : { field: email, extra: password };
    if (!credentials.field || !credentials.extra) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, tab === 'manager' ? pin : password);
      toast.success('Welcome back!');
      navigate(tab === 'student' ? '/' : '/kitchen');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, role: string) => {
    setLoading(true);
    try {
      await login(email, 'password');
      toast.success(`Signed in as ${role}`);
      navigate(role === 'STUDENT' ? '/' : '/kitchen');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
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
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Server Live</span>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-md">
          {/* Welcome Card with Google Sign-In */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-5">Sign in to access your canteen account</p>

            {/* Google Sign-In Button */}
            <div id="google-signin-btn" className="w-full" />

            {googleLoading && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                <span className="h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                Signing in with Google...
              </div>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or sign in with email</span>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Create a new account
            </Link>
          </div>

          {/* Email/Password Login Card */}
          <div className="bg-white rounded-2xl shadow-xl">
            {/* Tab Bar */}
            <div className="flex border-b border-slate-200 rounded-t-2xl">
              <button
                onClick={() => { setTab('student'); setEmail('student@college.edu'); setPassword(''); setPin(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                  tab === 'student'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="h-4 w-4" />
                Student
              </button>
              <button
                onClick={() => { setTab('staff'); setEmail('kitchen@college.edu'); setPassword(''); setPin(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                  tab === 'staff'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ChefHat className="h-4 w-4" />
                Staff
              </button>
              <button
                onClick={() => { setTab('manager'); setEmail('kitchen@college.edu'); setPassword(''); setPin(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                  tab === 'manager'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className="h-4 w-4" />
                Manager
              </button>
            </div>

            {/* Quick Login Profiles */}
            <div className="px-6 pt-5 pb-3">
              <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">
                {tab === 'student' ? 'Quick Access — Demo Profiles' : tab === 'manager' ? 'Quick Access — Manager Accounts' : 'Quick Access — Staff Accounts'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {tab === 'student' && (
                  <>
                    <QuickProfile
                      name="Rahul Kumar"
                      dept="Computer Science"
                      role="STUDENT"
                      onClick={() => quickLogin('student@college.edu', 'STUDENT')}
                      disabled={loading}
                    />
                    <QuickProfile
                      name="Priya Sharma"
                      dept="Kitchen Staff"
                      role="STAFF"
                      onClick={() => quickLogin('kitchen@college.edu', 'KITCHEN_STAFF')}
                      disabled={loading}
                    />
                  </>
                )}
                {tab === 'staff' && (
                  <>
                    <QuickProfile
                      name="Kitchen Staff"
                      dept="Canteen Operations"
                      role="STAFF"
                      onClick={() => quickLogin('kitchen@college.edu', 'KITCHEN_STAFF')}
                      disabled={loading}
                    />
                    <QuickProfile
                      name="Chef Account"
                      dept="Kitchen Station #1"
                      role="STAFF"
                      onClick={() => quickLogin('kitchen@college.edu', 'KITCHEN_STAFF')}
                      disabled={loading}
                    />
                  </>
                )}
                {tab === 'manager' && (
                  <>
                    <QuickProfile
                      name="Canteen Manager"
                      dept="Administration"
                      role="MANAGER"
                      onClick={() => quickLogin('kitchen@college.edu', 'MANAGER')}
                      disabled={loading}
                    />
                    <QuickProfile
                      name="Head Chef"
                      dept="Kitchen Management"
                      role="MANAGER"
                      onClick={() => quickLogin('kitchen@college.edu', 'MANAGER')}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {tab === 'student' ? 'Email Address' : tab === 'manager' ? 'Manager Email' : 'Staff Email or Official ID'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    placeholder={tab === 'student' ? 'student@college.edu' : 'kitchen@college.edu'}
                  />
                </div>
              </div>

              {tab === 'manager' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Security PIN
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                      placeholder="Enter your security PIN"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {tab === 'student' ? 'Enter Student Workspace' : tab === 'manager' ? 'Access Manager Dashboard' : 'Authorize & Enter Kitchen'}
                    →
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Demo mode: any {tab === 'manager' ? 'PIN' : 'password'} works with the demo emails above
              </p>
            </form>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure Campus Network
              </span>
              <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickProfile({
  name,
  dept,
  role,
  onClick,
  disabled,
}: {
  name: string;
  dept: string;
  role: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const roleColors: Record<string, string> = {
    STUDENT: 'bg-indigo-100 text-indigo-700',
    STAFF: 'bg-amber-100 text-amber-700',
    MANAGER: 'bg-purple-100 text-purple-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all disabled:opacity-50 group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-8 w-8 bg-slate-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${roleColors[role] || 'bg-slate-100 text-slate-600'}`}>
            {role}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 truncate">{dept}</p>
    </button>
  );
}
