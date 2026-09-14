import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { QueuePage } from './pages/QueuePage';
import { OrderPage } from './pages/OrderPage';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { PriceManagementPage } from './pages/PriceManagementPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes — require auth */}
            <Route element={<ProtectedRoute />}>
              {/* Profile completion — requires auth but profile not complete */}
              <Route path="/complete-profile" element={<CompleteProfilePage />} />

              {/* Main app layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<MenuPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<QueuePage />} />
                <Route path="/orders/:id" element={<OrderPage />} />
                <Route path="/kitchen" element={<KitchenDashboard />} />
                <Route path="/kitchen/menu" element={<MenuManagementPage />} />
                <Route path="/kitchen/inventory" element={<InventoryPage />} />
                <Route path="/kitchen/pricing" element={<PriceManagementPage />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
