import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MenuPage } from './pages/MenuPage';
import { QueuePage } from './pages/QueuePage';
import { OrderPage } from './pages/OrderPage';
import { KitchenDashboard } from './pages/KitchenDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<MenuPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/orders" element={<QueuePage />} />
                <Route path="/orders/:id" element={<OrderPage />} />
                <Route path="/kitchen" element={<KitchenDashboard />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
