import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { quoteAPI } from '../../services/api'
import '../../styles/QuoteToOrder.css'

function QuoteToOrder() {
  const { quoteNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchQuote()
  }, [user, quoteNumber])

  const fetchQuote = async () => {
    try {
      setLoading(true)
      const result = await quoteAPI.getByNumber(quoteNumber)
      
      if (result.success && result.data?.data) {
        const quoteData = result.data.data
        
        // Check if quote is approved
        if (quoteData.status !== 'APPROVED') {
          setError('Quote is not approved for conversion')
          return
        }
        
        // Check if quote is expired
        if (quoteData.isExpired) {
          setError('Quote has expired and cannot be converted to order')
          return
        }
        
        setQuote(quoteData)
        setShippingAddress(quoteData.shippingAddress || '')
      } else {
        setError('Quote not found')
      }
    } catch (err) {
      console.error('Failed to fetch quote:', err)
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('Please provide a shipping address')
      return
    }

    setSubmitting(true)
    try {
      const result = await quoteAPI.convertToOrder(quoteNumber, {
        shippingAddress,
        notes
      })

      if (result.success && result.data?.data) {
        const orderNumber = result.data.data.orderNumber
        navigate(`/orders/${orderNumber}`, {
          state: { fromQuote: true, quoteNumber }
        })
      } else {
        alert(result.message || 'Failed to convert quote to order')
      }
    } catch (err) {
      console.error('Error converting quote:', err)
      alert('Error converting quote to order')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="quote-to-order-page">
        <div className="loading">Loading quote...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="quote-to-order-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Cannot Convert Quote</h2>
          <p>{error}</p>
          <Link to="/quotes" className="btn-back">Back to Quotes</Link>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="quote-to-order-page">
        <div className="error-container">
          <div className="error-icon">📋</div>
          <h2>Quote Not Found</h2>
          <Link to="/quotes" className="btn-back">Back to Quotes</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="quote-to-order-page">
      <div className="quote-order-container">
        <div className="page-header">
          <Link to={`/quotes/${quoteNumber}`} className="back-link">
            ← Back to Quote
          </Link>
          <h1>Convert Quote to Order</h1>
          <p className="subtitle">Review and confirm your order from Quote {quote.quoteNumber}</p>
        </div>

        <div className="order-content">
          {/* Quote Summary */}
          <div className="section quote-summary">
            <div className="section-header">
              <h2>📋 Quote Summary</h2>
              <span className="quote-badge">Approved</span>
            </div>
            
            <div className="quote-meta">
              <div className="meta-item">
                <span className="label">Quote Number:</span>
                <span className="value">{quote.quoteNumber}</span>
              </div>
              <div className="meta-item">
                <span className="label">Supplier:</span>
                <span className="value">{quote.supplierName}</span>
              </div>
              <div className="meta-item">
                <span className="label">Approved On:</span>
                <span className="value">{formatDate(quote.approvedAt)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Valid Until:</span>
                <span className="value">{formatDate(quote.validUntil)}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="section products-section">
            <h2>📦 Products</h2>
            <div className="products-list">
              {quote.items?.map((item, idx) => (
                <div key={item.id || idx} className="product-item">
                  <div className="product-main">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} />
                    )}
                    <div className="product-info">
                      <h3>{item.productName}</h3>
                      <p className="quantity">Quantity: {item.quantity} {item.unit}s</p>
                      {item.leadTimeDays && (
                        <p className="lead-time">Lead time: {item.leadTimeDays} days</p>
                      )}
                    </div>
                  </div>
                  <div className="product-pricing">
                    {item.originalPrice !== item.finalPrice && (
                      <span className="original-price">₹{item.originalPrice?.toLocaleString('en-IN')}</span>
                    )}
                    <span className="final-price">₹{(item.finalPrice || item.quotedPrice)?.toLocaleString('en-IN')}</span>
                    <span className="line-total">₹{item.lineTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="section pricing-section">
            <h2>💰 Pricing</h2>
            <div className="pricing-breakdown">
              <div className="price-row">
                <span>Original Total:</span>
                <span className="original">₹{quote.originalTotal?.toLocaleString('en-IN')}</span>
              </div>
              {quote.discountPercentage > 0 && (
                <div className="price-row discount">
                  <span>Discount ({quote.discountPercentage}%):</span>
                  <span>-₹{quote.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Final Total:</span>
                <span>₹{(quote.finalTotal || quote.quotedTotal)?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="section shipping-section">
            <h2>🚚 Shipping Address</h2>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your complete shipping address..."
              rows="4"
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="section notes-section">
            <h2>📝 Additional Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the order..."
              rows="3"
            />
          </div>

          {/* Quote Origin Notice */}
          <div className="quote-notice">
            <div className="notice-icon">ℹ️</div>
            <div className="notice-content">
              <h4>This order is created from a quote</h4>
              <p>The order will reference Quote #{quote.quoteNumber} and include all negotiated pricing.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="order-actions">
            <Link to={`/quotes/${quoteNumber}`} className="btn-cancel">
              Cancel
            </Link>
            <button 
              className="btn-place-order"
              onClick={handleConvertToOrder}
              disabled={submitting || !shippingAddress.trim()}
            >
              {submitting ? 'Processing...' : '✓ Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteToOrder
