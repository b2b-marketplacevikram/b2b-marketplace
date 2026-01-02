import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { MessagingProvider } from './context/MessagingContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ToastNotification from './components/ToastNotification'
import CookieConsent from './components/CookieConsent'

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
import PaymentInstructions from './pages/buyer/PaymentInstructions'
import MultiSupplierPaymentInstructions from './pages/buyer/MultiSupplierPaymentInstructions'
import QuotesList from './pages/buyer/QuotesList'
import QuoteToOrder from './pages/buyer/QuoteToOrder'
import BuyerBankDetails from './pages/buyer/BuyerBankDetails'
import RefundRequests from './pages/buyer/RefundRequests'

// Quote Pages
import QuoteDetail from './pages/QuoteDetail'

// Dispute Pages
import DisputeList from './pages/DisputeList'
import DisputeDetail from './pages/DisputeDetail'
import DisputeManagement from './pages/DisputeManagement'

// Supplier Journey Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import ProductManagement from './pages/supplier/ProductManagement'
import OrderManagement from './pages/supplier/OrderManagement'
import SupplierOrderDetail from './pages/supplier/SupplierOrderDetail'
import Analytics from './pages/supplier/Analytics'
import BundleManagement from './pages/supplier/BundleManagement'
import PaymentVerification from './pages/supplier/PaymentVerification'
import BankDetails from './pages/supplier/BankDetails'
import NotificationSettings from './pages/supplier/NotificationSettings'
import QuoteManagement from './pages/supplier/QuoteManagement'

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

// Legal Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import GrievanceOfficer from './pages/legal/GrievanceOfficer'
import RefundPolicy from './pages/legal/RefundPolicy'

function App() {
  console.log('App component rendering...')
  
  return (
    <AuthProvider>
      <ToastProvider>
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
                      <Route path="/orders/:orderNumber/payment-instructions" element={<PaymentInstructions />} />
                      <Route path="/orders/multi-payment-instructions" element={<MultiSupplierPaymentInstructions />} />
                      <Route path="/orders" element={<OrderHistory />} />
                      <Route path="/orders/:orderId" element={<OrderTracking />} />
                      <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/account" element={<Account />} />
                    
                      {/* Buyer Bank Details & Refunds */}
                    <Route path="/buyer/bank-details" element={<BuyerBankDetails />} />
                    <Route path="/buyer/refunds" element={<RefundRequests />} />
                    
                    {/* Bundle Routes */}
                    <Route path="/bundles" element={<BundleList />} />
                    <Route path="/bundles/:id" element={<BundleDetails />} />
                    
                    {/* Quote Routes - Buyer */}
                    <Route path="/quotes" element={<QuotesList />} />
                    <Route path="/quotes/:quoteNumber" element={<QuoteDetail />} />
                    <Route path="/quotes/:quoteNumber/order" element={<QuoteToOrder />} />
                    
                    {/* Dispute Routes - Buyer */}
                    <Route path="/disputes" element={<DisputeList />} />
                    <Route path="/disputes/:ticketNumber" element={<DisputeDetail />} />
                    
                    {/* Supplier Routes */}
                    <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                    <Route path="/supplier/products" element={<ProductManagement />} />
                    <Route path="/supplier/bundles" element={<BundleManagement />} />
                    <Route path="/supplier/orders" element={<OrderManagement />} />
                    <Route path="/supplier/orders/:orderId" element={<SupplierOrderDetail />} />
                    <Route path="/supplier/payments" element={<PaymentVerification />} />
                    <Route path="/supplier/bank-details" element={<BankDetails />} />
                    <Route path="/supplier/notifications" element={<NotificationSettings />} />
                    <Route path="/supplier/analytics" element={<Analytics />} />
                    <Route path="/supplier/quotes" element={<QuoteManagement />} />
                    <Route path="/supplier/quotes/:quoteNumber" element={<QuoteDetail />} />
                    <Route path="/supplier/disputes" element={<DisputeManagement />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/products" element={<AdminProductManagement />} />
                    <Route path="/admin/orders" element={<AdminOrderManagement />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Legal Routes */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/grievance" element={<GrievanceOfficer />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                  </Routes>
                </main>
                <Footer />
                <CookieConsent />
              </div>
            </Router>
          </MessagingProvider>
        </NotificationProvider>
      </CartProvider>
    </ToastProvider>
  </AuthProvider>
  )
}

export default App
