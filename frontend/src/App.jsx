import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import InventoryPage from './pages/InventoryPage';
import CategoriesPage from './pages/CategoriesPage';

export default function App() {
  return (
    <div className="hb-app">
      <Navbar />
      <main className="hb-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <section className="hb-section">
                <h2>404</h2>
                <p>Page not found.</p>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="hb-footer">
        <small>
          Haat-Bazar · React + Vite · {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}
