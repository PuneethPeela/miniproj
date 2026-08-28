import { NavLink, Outlet } from 'react-router-dom';
import { UtensilsCrossed, Clock, ChefHat, LayoutGrid, LogOut, User, Utensils, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const studentLinks = [
  { to: '/', icon: LayoutGrid, label: 'Menu' },
  { to: '/orders', icon: Clock, label: 'Orders' },
];

const kitchenLinks = [
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen' },
  { to: '/kitchen/menu', icon: Utensils, label: 'Manage' },
  { to: '/orders', icon: Clock, label: 'Queue' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const links = user?.role === 'KITCHEN_STAFF' ? kitchenLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-base text-slate-900">SmartCanteen</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                    {user?.role === 'KITCHEN_STAFF' ? 'Kitchen Staff' : 'Student'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-slate-500"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
