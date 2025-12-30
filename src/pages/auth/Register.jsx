import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultUserType = searchParams.get('type') || 'buyer'
  
  const [formData, setFormData] = useState({
    userType: defaultUserType,
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    // Buyer fields
    firstName: '',
    lastName: '',
    // Supplier fields
    companyName: '',
    businessType: '',
    country: '',
    phone: '',
    acceptTerms: false
  })

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }

    // Prepare data for API
    const registrationData = {
      email: formData.email,
      password: formData.password,
      fullName: formData.userType === 'supplier' 
        ? formData.companyName 
        : formData.userType === 'admin'
        ? formData.firstName
        : `${formData.firstName} ${formData.lastName}`,
      userType: formData.userType.toUpperCase(),
      phone: formData.phone,
      companyName: formData.companyName,
      businessType: formData.businessType,
      country: formData.country
    }

    // Call real API
    const result = await register(registrationData)
    
    if (result.success) {
      // Redirect based on user type
      if (formData.userType === 'supplier') {
        navigate('/supplier/dashboard')
      } else if (formData.userType === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } else {
      alert(result.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create an Account</h1>
          <p className="auth-subtitle">Join thousands of buyers and suppliers</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>I want to:</label>
              <div className="user-type-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="buyer"
                    checked={formData.userType === 'buyer'}
                    onChange={handleInputChange}
                  />
                  <span>Buy Products</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="supplier"
                    checked={formData.userType === 'supplier'}
                    onChange={handleInputChange}
                  />
                  <span>Sell Products</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={formData.userType === 'admin'}
                    onChange={handleInputChange}
                  />
                  <span>Admin Access</span>
                </label>
              </div>
            </div>

            {formData.userType === 'admin' ? (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Administrator Name"
                    required
                  />
                </div>
              </>
            ) : formData.userType === 'buyer' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Company Name <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your Company Ltd."
                    required
                  />
                  <small className="form-hint">This will appear in messages with suppliers</small>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Telangana">Telangana</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1-555-123-4567"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your Company Ltd."
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Business Type</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="distributor">Distributor</option>
                      <option value="trader">Trading Company</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Telangana">Telangana</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91-98765-43210"
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength="8"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                />
                <span>
                  I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-features">
          <h2>
            {formData.userType === 'supplier' 
              ? 'Start Selling Today' 
              : 'Start Shopping Today'}
          </h2>
          <div className="feature-list">
            {formData.userType === 'supplier' ? (
              <>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <div>
                    <h3>Global Reach</h3>
                    <p>Access millions of buyers worldwide</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <div>
                    <h3>Grow Your Business</h3>
                    <p>Powerful tools to manage and scale</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💼</span>
                  <div>
                    <h3>Free Membership</h3>
                    <p>Start with no upfront costs</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="feature-item">
                  <span className="feature-icon">🛒</span>
                  <div>
                    <h3>Easy Purchasing</h3>
                    <p>Simple ordering and payment process</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <h3>Buyer Protection</h3>
                    <p>Secure transactions guaranteed</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h3>Fast Delivery</h3>
                    <p>Quick shipping worldwide</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
