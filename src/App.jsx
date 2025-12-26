import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { MessagingProvider } from './context/MessagingContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ToastNotification from './components/ToastNotification'

// Buyer Journey Pages
import Home from './pages/buyer/Home'
import ProductSearch from './pages/buyer/ProductSearch'
import ProductDetails from './pages/buyer/ProductDetails'
import SupplierProfile from './pages/buyer/SupplierProfile'
import Cart from './pages/buyer/Cart'
import Checkout from './pages/buyer/Checkout'
import OrderTracking from './pages/buyer/OrderTracking'
import OrderHistory from './pages/buyer/OrderHistory'
import Messages from './pages/buyer/Messages'
import Account from './pages/buyer/Account'
import OrderSuccess from './pages/buyer/OrderSuccess'

// Supplier Journey Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import ProductManagement from './pages/supplier/ProductManagement'
import OrderManagement from './pages/supplier/OrderManagement'
import SupplierOrderDetail from './pages/supplier/SupplierOrderDetail'
import Analytics from './pages/supplier/Analytics'
import BundleManagement from './pages/supplier/BundleManagement'

// Bundle Pages
import BundleList from './pages/buyer/BundleList'
import BundleDetails from './pages/buyer/BundleDetails'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AdminProductManagement from './pages/admin/ProductManagement'
import AdminOrderManagement from './pages/admin/OrderManagement'

function App() {
  console.log('App component rendering...')
  
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <MessagingProvider>
            <Router>
              <div className="app">
                <Header />
                <ToastNotification />
                <main className="main-content">
                  <Routes>
                    {/* Buyer Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<ProductSearch />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/supplier/:id" element={<SupplierProfile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:orderId" element={<OrderTracking />} />
                    <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/account" element={<Account />} />
                    
                    {/* Bundle Routes */}
                    <Route path="/bundles" element={<BundleList />} />
                    <Route path="/bundles/:id" element={<BundleDetails />} />
                    
                    {/* Supplier Routes */}
                    <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                    <Route path="/supplier/products" element={<ProductManagement />} />
                    <Route path="/supplier/bundles" element={<BundleManagement />} />
                    <Route path="/supplier/orders" element={<OrderManagement />} />
                    <Route path="/supplier/orders/:orderId" element={<SupplierOrderDetail />} />
                    <Route path="/supplier/analytics" element={<Analytics />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/products" element={<AdminProductManagement />} />
                    <Route path="/admin/orders" element={<AdminOrderManagement />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </MessagingProvider>
    </NotificationProvider>
  </CartProvider>
</AuthProvider>
  )
}

export default App
