import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { quoteAPI } from '../services/api'
import '../styles/RequestQuoteModal.css'

/**
 * Modal component for requesting quotes.
 * Supports single product, multiple products, and cart-based quotes.
 */
function RequestQuoteModal({ isOpen, onClose, products, supplierId, supplierName, isFromCart = false }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [quoteNumber, setQuoteNumber] = useState('')

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerCompany: '',
    shippingAddress: '',
    buyerRequirements: '',
    items: []
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        buyerName: user.name || user.username || '',
        buyerEmail: user.email || '',
        buyerPhone: user.phone || '',
        buyerCompany: user.company || user.companyName || ''
      }))
    }
  }, [user])

  useEffect(() => {
    if (products && products.length > 0) {
      const items = products.map(p => ({
        productId: p.id || p.productId,
        productName: p.name || p.productName,
        productImage: p.image || p.productImage || p.images?.[0] || '',
        quantity: p.quantity || p.moq || 100,
        originalPrice: p.price || p.unitPrice || 0,
        unit: p.unit || 'piece',
        specifications: ''
      }))
      setFormData(prev => ({ ...prev, items }))
    }
  }, [products])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const quoteData = {
        buyerId: user?.id,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerCompany: formData.buyerCompany,
        supplierId: supplierId,
        supplierName: supplierName,
        shippingAddress: formData.shippingAddress,
        buyerRequirements: formData.buyerRequirements,
        isFromCart: isFromCart,
        items: formData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: parseInt(item.quantity),
          originalPrice: parseFloat(item.originalPrice),
          unit: item.unit,
          specifications: item.specifications
        }))
      }

      const result = await quoteAPI.create(quoteData)

      if (result.success) {
        setSuccess(true)
        setQuoteNumber(result.data.data?.quoteNumber || 'QT-XXXXXX')
      } else {
        setError(result.message || 'Failed to submit quote request')
      }
    } catch (err) {
      console.error('Quote submission error:', err)
      setError('An error occurred while submitting your quote request')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setError('')
    onClose()
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.originalPrice) * parseInt(item.quantity || 0))
    }, 0)
  }

  if (!isOpen) return null

  return (
    <div className="quote-modal-overlay" onClick={handleClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className="quote-success">
            <div className="success-icon">✓</div>
            <h2>Quote Request Submitted!</h2>
            <p className="quote-number">Quote Number: <strong>{quoteNumber}</strong></p>
            <p>Your quote request has been sent to {supplierName}.</p>
            <p>You will receive a response within 24-48 hours.</p>
            <div className="success-info">
              <div className="info-item">
                <span className="icon">📧</span>
                <span>Email notification will be sent</span>
              </div>
              <div className="info-item">
                <span className="icon">⏰</span>
                <span>Quote valid for 15 days</span>
              </div>
              <div className="info-item">
                <span className="icon">💬</span>
                <span>Negotiate directly with supplier</span>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn-primary" onClick={handleClose}>Close</button>
              <a href="/quotes" className="btn-secondary">View My Quotes</a>
            </div>
          </div>
        ) : (
          <>
            <div className="quote-modal-header">
              <h2>Request Quote</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="quote-form">
              {error && <div className="error-message">{error}</div>}

              <div className="quote-items-section">
                <h3>Products ({formData.items.length})</h3>
                <div className="quote-items">
                  {formData.items.map((item, index) => (
                    <div key={index} className="quote-item">
                      <div className="item-image">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} />
                        ) : (
                          <div className="placeholder-image">📦</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.productName}</h4>
                        <div className="item-price">₹{parseFloat(item.originalPrice).toLocaleString('en-IN')}/{item.unit}</div>
                      </div>
                      <div className="item-quantity">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                        <span className="unit">{item.unit}s</span>
                      </div>
                      <div className="item-total">
                        ₹{(parseFloat(item.originalPrice) * parseInt(item.quantity || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="quote-summary">
                  <span>Estimated Total:</span>
                  <span className="total-amount">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
                <p className="quote-note">* Final pricing will be provided by the supplier</p>
              </div>

              <div className="form-section">
                <h3>Your Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="buyerCompany"
                      value={formData.buyerCompany}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="buyerEmail"
                      value={formData.buyerEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={handleInputChange}
                      placeholder="+91-98765-43210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Shipping Address</h3>
                <div className="form-group">
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Enter your complete shipping address including PIN code"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Special Requirements</h3>
                <div className="form-group">
                  <textarea
                    name="buyerRequirements"
                    value={formData.buyerRequirements}
                    onChange={handleInputChange}
                    placeholder="Any specific requirements, customizations, delivery timeline, bulk discounts expected, etc."
                    rows="4"
                  />
                </div>
              </div>

              <div className="supplier-info">
                <span className="icon">🏪</span>
                <span>Requesting quote from: <strong>{supplierName}</strong></span>
              </div>

              <div className="quote-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Quote Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default RequestQuoteModal
