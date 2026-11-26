import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './features/theme/ThemeContext';
import { AuthProvider } from './features/auth/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/Home/HomePage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { OfferDetailPage } from './pages/OfferDetail/OfferDetailPage';
import { MyOrdersPage } from './pages/MyOrders/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetail/OrderDetailPage';
import { PickupTokenPage } from './pages/PickupToken/PickupTokenPage';
import { HowItWorksPage } from './pages/HowItWorks/HowItWorksPage';
import { CartPage } from './pages/Cart/CartPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="offers" element={<HomePage />} />
              <Route path="offers/:id" element={<OfferDetailPage />} />
              <Route path="products" element={<HomePage />} />
              <Route path="products/:id" element={<OfferDetailPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* Protected Routes — require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="orders/:id/pickup-token" element={<PickupTokenPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
