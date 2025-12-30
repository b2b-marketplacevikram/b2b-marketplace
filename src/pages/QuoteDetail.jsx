import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { quoteAPI } from '../services/api'
import '../styles/QuoteDetail.css'

function QuoteDetail() {
  const { quoteNumber } = useParams()
  const navigate = useNavigate()
  const { user, isBuyer, isSupplier } = useAuth()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPricingForm, setShowPricingForm] = useState(false)
  const [pricingData, setPricingData] = useState({
    itemPricing: [],
    supplierNotes: '',
    discountPercentage: 0,
    validityDays: 15
  })
  const [submitting, setSubmitting] = useState(false)

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
        setQuote(quoteData)
        
        // Initialize pricing data from quote items
        setPricingData(prev => ({
          ...prev,
          itemPricing: quoteData.items?.map(item => ({
            itemId: item.id,
            quotedPrice: item.quotedPrice || item.originalPrice,
            quantity: item.quantity,
            leadTimeDays: item.leadTimeDays || 7,
            supplierNotes: item.supplierNotes || ''
          })) || [],
          supplierNotes: quoteData.supplierNotes || '',
          discountPercentage: quoteData.discountPercentage || 0,
          validityDays: quoteData.validityDays || 15
        }))
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

  const getStatusClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'SUPPLIER_RESPONDED': 'status-responded',
      'BUYER_REVIEWING': 'status-reviewing',
      'NEGOTIATING': 'status-negotiating',
      'APPROVED': 'status-approved',
      'CONVERTED': 'status-converted',
      'REJECTED': 'status-rejected',
      'CANCELLED': 'status-cancelled',
      'EXPIRED': 'status-expired'
    }
    return statusClasses[status] || 'status-pending'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePricingChange = (itemId, field, value) => {
    setPricingData(prev => ({
      ...prev,
      itemPricing: prev.itemPricing.map(item =>
        item.itemId === itemId ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmitResponse = async () => {
    setSubmitting(true)
    try {
      const result = await quoteAPI.respond(quoteNumber, pricingData)
      if (result.success) {
        setShowPricingForm(false)
        fetchQuote()
      } else {
        alert(result.message || 'Failed to submit response')
      }
    } catch (err) {
      alert('Error submitting response')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!window.confirm('Approve this quote with final pricing? The buyer will be able to place an order.')) return

    setSubmitting(true)
    try {
      const approvalData = {
        supplierNotes: pricingData.supplierNotes,
        discountPercentage: pricingData.discountPercentage,
        finalPricing: pricingData.itemPricing.map(item => ({
          itemId: item.itemId,
          finalPrice: item.quotedPrice,
          quantity: item.quantity,
          leadTimeDays: item.leadTimeDays
        }))
      }

      const result = await quoteAPI.approve(quoteNumber, approvalData)
      if (result.success) {
        fetchQuote()
      } else {
        alert(result.message || 'Failed to approve quote')
      }
    } catch (err) {
      alert('Error approving quote')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please enter rejection reason:')
    if (!reason) return

    setSubmitting(true)
    try {
      const result = await quoteAPI.reject(quoteNumber, reason)
      if (result.success) {
        fetchQuote()
      } else {
        alert(result.message || 'Failed to reject quote')
      }
    } catch (err) {
      alert('Error rejecting quote')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSubmitting(true)
    try {
      const messageData = {
        senderId: user.id,
        senderName: user.name || user.username,
        senderType: isBuyer ? 'BUYER' : 'SUPPLIER',
        message: message,
        messageType: 'TEXT'
      }

      const result = await quoteAPI.addMessage(quoteNumber, messageData)
      if (result.success) {
        setMessage('')
        fetchQuote()
      } else {
        alert(result.message || 'Failed to send message')
      }
    } catch (err) {
      alert('Error sending message')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCounterOffer = async () => {
    if (!message.trim()) {
      alert('Please enter your counter-offer message')
      return
    }

    setSubmitting(true)
    try {
      const result = await quoteAPI.counterOffer(quoteNumber, message)
      if (result.success) {
        setMessage('')
        fetchQuote()
      } else {
        alert(result.message || 'Failed to send counter-offer')
      }
    } catch (err) {
      alert('Error sending counter-offer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConvertToOrder = async () => {
    navigate(`/quotes/${quoteNumber}/order`)
  }

  const calculateTotal = () => {
    return pricingData.itemPricing.reduce((total, item) => {
      return total + (parseFloat(item.quotedPrice) * parseInt(item.quantity))
    }, 0)
  }

  if (loading) {
    return <div className="quote-detail-page"><div className="loading">Loading quote...</div></div>
  }

  if (error) {
    return <div className="quote-detail-page"><div className="error-message">{error}</div></div>
  }

  if (!quote) {
    return <div className="quote-detail-page"><div className="error-message">Quote not found</div></div>
  }

  return (
    <div className="quote-detail-page">
      <div className="quote-detail-container">
        {/* Header */}
        <div className="quote-header">
          <div className="header-left">
            <Link to={isBuyer ? '/quotes' : '/supplier/quotes'} className="back-link">
              ← Back to Quotes
            </Link>
            <h1>Quote {quote.quoteNumber}</h1>
            <span className={`status-badge ${getStatusClass(quote.status)}`}>
              {quote.statusLabel}
            </span>
          </div>
          <div className="header-right">
            {quote.isExpired && (
              <span className="expired-badge">⚠️ Expired</span>
            )}
            {!quote.isExpired && quote.daysRemaining !== undefined && (
              <span className="validity-info">
                Valid for {quote.daysRemaining} days
              </span>
            )}
          </div>
        </div>

        <div className="quote-content">
          {/* Main Info */}
          <div className="main-section">
            {/* Parties Info */}
            <div className="parties-info">
              <div className="party buyer-party">
                <h3>Buyer</h3>
                <p className="name">{quote.buyerName}</p>
                <p>{quote.buyerCompany}</p>
                <p>{quote.buyerEmail}</p>
                <p>{quote.buyerPhone}</p>
              </div>
              <div className="party supplier-party">
                <h3>Supplier</h3>
                <p className="name">{quote.supplierName}</p>
              </div>
            </div>

            {/* Products */}
            <div className="products-section">
              <h3>Products</h3>
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Original Price</th>
                      {(quote.status !== 'PENDING' || isSupplier) && <th>Quoted Price</th>}
                      {quote.finalTotal && <th>Final Price</th>}
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items?.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <div className="product-cell">
                            {item.productImage && (
                              <img src={item.productImage} alt={item.productName} />
                            )}
                            <div className="product-info">
                              <span className="product-name">{item.productName}</span>
                              <span className="product-unit">/{item.unit}</span>
                            </div>
                          </div>
                        </td>
                        <td>{item.quantity} {item.unit}s</td>
                        <td>₹{item.originalPrice?.toLocaleString('en-IN')}</td>
                        {(quote.status !== 'PENDING' || isSupplier) && (
                          <td className="quoted-price">
                            ₹{(item.quotedPrice || item.originalPrice)?.toLocaleString('en-IN')}
                          </td>
                        )}
                        {quote.finalTotal && (
                          <td className="final-price">
                            ₹{(item.finalPrice || item.quotedPrice || item.originalPrice)?.toLocaleString('en-IN')}
                          </td>
                        )}
                        <td>₹{item.lineTotal?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="pricing-summary">
              <div className="summary-row">
                <span>Original Total:</span>
                <span className="original">₹{quote.originalTotal?.toLocaleString('en-IN')}</span>
              </div>
              {quote.quotedTotal && quote.quotedTotal !== quote.originalTotal && (
                <div className="summary-row">
                  <span>Quoted Total:</span>
                  <span className="quoted">₹{quote.quotedTotal?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {quote.discountPercentage > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({quote.discountPercentage}%):</span>
                  <span>-₹{quote.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {quote.finalTotal && (
                <div className="summary-row final">
                  <span>Final Total:</span>
                  <span>₹{quote.finalTotal?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Requirements */}
            {quote.buyerRequirements && (
              <div className="requirements-section">
                <h3>Buyer Requirements</h3>
                <p>{quote.buyerRequirements}</p>
              </div>
            )}

            {/* Supplier Notes */}
            {quote.supplierNotes && (
              <div className="supplier-notes-section">
                <h3>Supplier Notes</h3>
                <p>{quote.supplierNotes}</p>
              </div>
            )}

            {/* Shipping Address */}
            {quote.shippingAddress && (
              <div className="shipping-section">
                <h3>Shipping Address</h3>
                <p>{quote.shippingAddress}</p>
              </div>
            )}

            {/* Pricing Form (Supplier Only) */}
            {isSupplier && showPricingForm && ['PENDING', 'NEGOTIATING'].includes(quote.status) && (
              <div className="pricing-form">
                <h3>Update Pricing</h3>
                <div className="pricing-items">
                  {pricingData.itemPricing.map((item, idx) => {
                    const quoteItem = quote.items?.find(qi => qi.id === item.itemId)
                    return (
                      <div key={item.itemId} className="pricing-item">
                        <span className="item-name">{quoteItem?.productName}</span>
                        <div className="pricing-fields">
                          <div className="field">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              value={item.quotedPrice}
                              onChange={(e) => handlePricingChange(item.itemId, 'quotedPrice', e.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handlePricingChange(item.itemId, 'quantity', e.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Lead Time (days)</label>
                            <input
                              type="number"
                              value={item.leadTimeDays}
                              onChange={(e) => handlePricingChange(item.itemId, 'leadTimeDays', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      value={pricingData.discountPercentage}
                      onChange={(e) => setPricingData(prev => ({ ...prev, discountPercentage: e.target.value }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="field">
                    <label>Validity (days)</label>
                    <input
                      type="number"
                      value={pricingData.validityDays}
                      onChange={(e) => setPricingData(prev => ({ ...prev, validityDays: e.target.value }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="field full-width">
                  <label>Supplier Notes</label>
                  <textarea
                    value={pricingData.supplierNotes}
                    onChange={(e) => setPricingData(prev => ({ ...prev, supplierNotes: e.target.value }))}
                    placeholder="Any notes for the buyer..."
                    rows="3"
                  />
                </div>

                <div className="pricing-total">
                  <span>New Total:</span>
                  <span className="amount">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>

                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setShowPricingForm(false)}>
                    Cancel
                  </button>
                  <button className="btn-submit" onClick={handleSubmitResponse} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Actions */}
            <div className="actions-card">
              <h3>Actions</h3>

              {/* Supplier Actions */}
              {isSupplier && (
                <>
                  {quote.status === 'PENDING' && (
                    <>
                      <button 
                        className="btn-primary"
                        onClick={() => setShowPricingForm(true)}
                      >
                        📝 Respond with Pricing
                      </button>
                      <button className="btn-danger" onClick={handleReject}>
                        ✕ Reject Quote
                      </button>
                    </>
                  )}

                  {['SUPPLIER_RESPONDED', 'NEGOTIATING'].includes(quote.status) && (
                    <>
                      <button 
                        className="btn-primary"
                        onClick={() => setShowPricingForm(true)}
                      >
                        📝 Update Pricing
                      </button>
                      <button className="btn-success" onClick={handleApprove}>
                        ✓ Approve & Finalize
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Buyer Actions */}
              {isBuyer && (
                <>
                  {quote.status === 'APPROVED' && !quote.isExpired && (
                    <button className="btn-success" onClick={handleConvertToOrder}>
                      🛒 Place Order
                    </button>
                  )}

                  {quote.status === 'CONVERTED' && quote.orderNumber && (
                    <Link to={`/orders/${quote.orderNumber}`} className="btn-primary">
                      📦 View Order
                    </Link>
                  )}

                  {['PENDING', 'SUPPLIER_RESPONDED', 'NEGOTIATING'].includes(quote.status) && (
                    <button 
                      className="btn-danger"
                      onClick={async () => {
                        if (window.confirm('Cancel this quote request?')) {
                          const result = await quoteAPI.cancel(quoteNumber)
                          if (result.success) fetchQuote()
                        }
                      }}
                    >
                      Cancel Quote
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline-card">
              <h3>Timeline</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <span className="icon">📋</span>
                  <div className="info">
                    <span className="label">Created</span>
                    <span className="date">{formatDate(quote.createdAt)}</span>
                  </div>
                </div>
                {quote.respondedAt && (
                  <div className="timeline-item">
                    <span className="icon">💬</span>
                    <div className="info">
                      <span className="label">Responded</span>
                      <span className="date">{formatDate(quote.respondedAt)}</span>
                    </div>
                  </div>
                )}
                {quote.approvedAt && (
                  <div className="timeline-item">
                    <span className="icon">✅</span>
                    <div className="info">
                      <span className="label">Approved</span>
                      <span className="date">{formatDate(quote.approvedAt)}</span>
                    </div>
                  </div>
                )}
                {quote.convertedToOrderAt && (
                  <div className="timeline-item">
                    <span className="icon">📦</span>
                    <div className="info">
                      <span className="label">Converted to Order</span>
                      <span className="date">{formatDate(quote.convertedToOrderAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="messages-card">
              <h3>Negotiation Thread ({quote.messages?.length || 0})</h3>
              <div className="messages-list">
                {quote.messages?.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.senderType?.toLowerCase()}`}>
                    <div className="message-header">
                      <span className="sender">{msg.senderName}</span>
                      <span className="time">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="message-text">{msg.message}</p>
                    {msg.messageType !== 'TEXT' && (
                      <span className="message-type">{msg.messageType}</span>
                    )}
                  </div>
                ))}
              </div>

              {!['CONVERTED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(quote.status) && (
                <div className="message-input">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows="2"
                  />
                  <div className="message-actions">
                    <button onClick={handleSendMessage} disabled={submitting || !message.trim()}>
                      Send
                    </button>
                    {isBuyer && ['SUPPLIER_RESPONDED'].includes(quote.status) && (
                      <button 
                        className="btn-counter"
                        onClick={handleCounterOffer}
                        disabled={submitting || !message.trim()}
                      >
                        Send Counter-Offer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteDetail
