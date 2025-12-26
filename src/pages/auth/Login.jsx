import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'buyer'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Call real API
    const result = await login({
      email: formData.email,
      password: formData.password
    })
    
    if (result.success) {
      // Redirect based on user type from response (not from form)
      const userType = result.data?.userType || formData.userType
      if (userType === 'ADMIN' || formData.userType === 'admin') {
        navigate('/admin/dashboard')
      } else if (userType === 'SUPPLIER' || formData.userType === 'supplier') {
        navigate('/supplier/dashboard')
      } else {
        navigate('/')
      }
    } else {
      // Show error message
      alert(result.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Login to Your Account</h1>
          <p className="auth-subtitle">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>I am a:</label>
              <div className="user-type-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="buyer"
                    checked={formData.userType === 'buyer'}
                    onChange={handleInputChange}
                  />
                  <span>Buyer</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="supplier"
                    checked={formData.userType === 'supplier'}
                    onChange={handleInputChange}
                  />
                  <span>Supplier</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={formData.userType === 'admin'}
                    onChange={handleInputChange}
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-option">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              Continue with Google
            </button>
            <button className="social-btn linkedin">
              Continue with LinkedIn
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>

        <div className="auth-features">
          <h2>Why Join B2B Marketplace?</h2>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <h3>Global Network</h3>
                <p>Connect with verified buyers and suppliers worldwide</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <h3>Secure Transactions</h3>
                <p>Protected payments and buyer protection guarantee</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <h3>Quality Assurance</h3>
                <p>All suppliers are thoroughly vetted and verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
