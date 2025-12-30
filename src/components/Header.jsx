import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CategoryMenu from './CategoryMenu'
import NavigationMenu from './NavigationMenu'
import NotificationCenter from './NotificationCenter'
import SearchBar from './SearchBar'
import '../styles/Header.css'

function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo">
            <h1>B2B Marketplace</h1>
          </Link>

          {user?.userType !== 'SUPPLIER' && (
            <div className="search-wrapper">
              <SearchBar placeholder="Search for products, suppliers, or categories..." />
            </div>
          )}

          <nav className="main-nav">
            <Link to="/">Home</Link>
            {user?.userType === 'ADMIN' ? (
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/users">User Management</Link>
                <Link to="/admin/products">Products</Link>
                <Link to="/admin/orders">Orders</Link>
                <Link to="/messages">Messages</Link>
                <Link to="/account">My Account</Link>
              </>
            ) : user?.userType === 'SUPPLIER' ? (
              <>
                <Link to="/supplier/products">My Products</Link>
                <Link to="/supplier/bundles">Bundles</Link>
                <Link to="/supplier/quotes">Quotes</Link>
                <Link to="/supplier/orders">Orders</Link>
                <Link to="/supplier/disputes">Disputes</Link>
                <Link to="/supplier/payments">Payments</Link>
                <Link to="/supplier/analytics">Analytics</Link>
                <Link to="/messages">Messages</Link>
                <Link to="/account">My Account</Link>
                <Link to="/supplier/dashboard">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/bundles">Bundles</Link>
                {user && <Link to="/quotes">My Quotes</Link>}
                {user && <Link to="/orders">My Orders</Link>}
                {user && <Link to="/disputes">My Tickets</Link>}
                {user && <Link to="/messages">Messages</Link>}
                {user && <Link to="/account">My Account</Link>}
              </>
            )}
          </nav>

          <div className="header-actions">
            {user && <NotificationCenter />}
            {user?.userType !== 'SUPPLIER' && (
              <Link to="/cart" className="cart-link">
                <span className="cart-icon">🛒</span>
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/register" className="btn-register">Register</Link>
              </div>
            )}
            <button className="mobile-menu-btn">☰</button>
          </div>
        </div>
      </div>

      {/* Navigation Menu with Mega Menu */}
      <NavigationMenu />
    </header>
  )
}

export default Header
