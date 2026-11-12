import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './features/theme/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/Home/HomePage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { OfferDetailPage } from './pages/OfferDetail/OfferDetailPage';
import { MyOrdersPage } from './pages/MyOrders/MyOrdersPage';
import { OrderDetailPage } from './pages/OrderDetail/OrderDetailPage';
import { PickupTokenPage } from './pages/PickupToken/PickupTokenPage';
import { HowItWorksPage } from './pages/HowItWorks/HowItWorksPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="offers" element={<HomePage />} />
            <Route path="offers/:id" element={<OfferDetailPage />} />
            <Route path="products" element={<HomePage />} />
            <Route path="products/:id" element={<OfferDetailPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<RegisterPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />

            {/* Prepared Protected Routes structure (requireAuth=false in Phase 2) */}
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="orders/:id/pickup-token" element={<PickupTokenPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
