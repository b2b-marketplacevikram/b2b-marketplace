import { Link } from 'react-router-dom'
import '../styles/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>B2B Marketplace</h3>
          <p>The leading platform connecting buyers and suppliers worldwide.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="Instagram">📷</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>For Buyers</h4>
          <ul>
            <li><Link to="/search">Browse Products</Link></li>
            <li><Link to="/search?category=electronics">Categories</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
            <li><Link to="/orders/123456">Track Order</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>For Suppliers</h4>
          <ul>
            <li><Link to="/register?type=supplier">Become a Supplier</Link></li>
            <li><Link to="/supplier/dashboard">Supplier Dashboard</Link></li>
            <li><Link to="/supplier/products">Manage Products</Link></li>
            <li><Link to="/supplier/orders">Manage Orders</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/grievance">Grievance Redressal</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>📧 support@b2bmarketplace.com</li>
            <li>📞 +1-800-B2B-SHOP</li>
            <li>📍 123 Commerce St, NY 10001</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 B2B Marketplace. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
