import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Hash, User, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

export function CompleteProfilePage() {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();

  const emailPrefix = user?.email?.split('@')[0] || '';
  const isMatch = rollNumber === emailPrefix && rollNumber.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rollNumber) {
      toast.error('Please enter your roll number');
      return;
    }
    setLoading(true);
    try {
      await completeProfile(rollNumber);
      toast.success('Profile completed! Welcome to SmartCanteen.');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

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
                <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Complete Profile</p>
                <h2 className="text-white text-xl font-bold">One last step</h2>
              </div>
            </div>
            <p className="text-indigo-200 text-sm">We need your roll number to verify your college identity.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-b-2xl shadow-xl p-6">
            {/* User Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600">
                    {user.name?.charAt(0) || user.email?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Roll Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 font-mono ${
                      rollNumber && !isMatch ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder={`e.g. ${emailPrefix}`}
                  />
                  {isMatch && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {rollNumber && !isMatch && (
                  <p className="text-xs text-red-600 mt-1">
                    Roll number must match your email prefix: <strong>{emailPrefix}</strong>
                  </p>
                )}
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-700">
                  Your roll number is derived from your college email. It should match the prefix before <strong>@matrusri.edu.in</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !isMatch}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
