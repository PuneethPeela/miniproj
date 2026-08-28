import { NavLink, Outlet } from 'react-router-dom';
import { UtensilsCrossed, Clock, ChefHat, LayoutGrid, LogOut, User, Utensils } from 'lucide-react';
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-lg text-slate-900">Smart Canteen</span>
            </div>

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
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
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
