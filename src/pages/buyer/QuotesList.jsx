import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { quoteAPI } from '../../services/api'
import '../../styles/QuotesList.css'

function QuotesList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchQuotes()
  }, [user, filter])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const status = filter !== 'ALL' ? filter : null
      const result = await quoteAPI.getBuyerQuotes(status)
      
      if (result.success && result.data?.data) {
        setQuotes(result.data.data)
      } else {
        setQuotes([])
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err)
      setError('Failed to load quotes')
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

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pending Review',
      'SUPPLIER_RESPONDED': 'Quote Received',
      'BUYER_REVIEWING': 'Under Review',
      'NEGOTIATING': 'In Negotiation',
      'APPROVED': 'Ready to Order',
      'CONVERTED': 'Converted to Order',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled',
      'EXPIRED': 'Expired'
    }
    return labels[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCancelQuote = async (quoteNumber) => {
    if (!window.confirm('Are you sure you want to cancel this quote request?')) return

    try {
      const result = await quoteAPI.cancel(quoteNumber)
      if (result.success) {
        fetchQuotes()
      } else {
        alert(result.message || 'Failed to cancel quote')
      }
    } catch (err) {
      alert('Error cancelling quote')
    }
  }

  return (
    <div className="quotes-list-page">
      <div className="quotes-container">
        <div className="quotes-header">
          <h1>My Quote Requests</h1>
          <p>Track and manage your quote requests from suppliers</p>
        </div>

        <div className="quotes-filters">
          <button 
            className={filter === 'ALL' ? 'active' : ''} 
            onClick={() => setFilter('ALL')}
          >
            All Quotes
          </button>
          <button 
            className={filter === 'PENDING' ? 'active' : ''} 
            onClick={() => setFilter('PENDING')}
          >
            Pending
          </button>
          <button 
            className={filter === 'SUPPLIER_RESPONDED' ? 'active' : ''} 
            onClick={() => setFilter('SUPPLIER_RESPONDED')}
          >
            Received
          </button>
          <button 
            className={filter === 'NEGOTIATING' ? 'active' : ''} 
            onClick={() => setFilter('NEGOTIATING')}
          >
            Negotiating
          </button>
          <button 
            className={filter === 'APPROVED' ? 'active' : ''} 
            onClick={() => setFilter('APPROVED')}
          >
            Ready to Order
          </button>
          <button 
            className={filter === 'CONVERTED' ? 'active' : ''} 
            onClick={() => setFilter('CONVERTED')}
          >
            Converted
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading quotes...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : quotes.length === 0 ? (
          <div className="no-quotes">
            <div className="empty-icon">📋</div>
            <h2>No quotes found</h2>
            <p>You haven't requested any quotes yet</p>
            <Link to="/search" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="quotes-list">
            {quotes.map(quote => (
              <div key={quote.id} className="quote-card">
                <div className="quote-header">
                  <div className="quote-number">
                    <span className="label">Quote #</span>
                    <span className="value">{quote.quoteNumber}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </span>
                </div>

                <div className="quote-supplier">
                  <span className="icon">🏪</span>
                  <span>{quote.supplierName || 'Supplier'}</span>
                </div>

                <div className="quote-items">
                  {quote.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="item-preview">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productName} />
                      )}
                      <div className="item-info">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {quote.items?.length > 3 && (
                    <div className="more-items">+{quote.items.length - 3} more</div>
                  )}
                </div>

                <div className="quote-pricing">
                  <div className="price-row">
                    <span>Original Total:</span>
                    <span className="original">₹{quote.originalTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {quote.quotedTotal && quote.quotedTotal !== quote.originalTotal && (
                    <div className="price-row">
                      <span>Quoted Total:</span>
                      <span className="quoted">₹{quote.quotedTotal?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {quote.finalTotal && (
                    <div className="price-row final">
                      <span>Final Total:</span>
                      <span className="final-price">₹{quote.finalTotal?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {quote.discountPercentage > 0 && (
                    <div className="discount-badge">
                      {quote.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <div className="quote-dates">
                  <div className="date-item">
                    <span className="label">Created:</span>
                    <span>{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="date-item">
                    <span className="label">Valid Until:</span>
                    <span className={quote.isExpired ? 'expired' : ''}>
                      {formatDate(quote.validUntil)}
                      {!quote.isExpired && quote.daysRemaining !== undefined && (
                        <span className="days-left">({quote.daysRemaining} days)</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="quote-actions">
                  <Link to={`/quotes/${quote.quoteNumber}`} className="btn-view">
                    View Details
                  </Link>
                  
                  {quote.status === 'APPROVED' && (
                    <Link to={`/quotes/${quote.quoteNumber}/order`} className="btn-order">
                      Place Order
                    </Link>
                  )}
                  
                  {quote.status === 'CONVERTED' && quote.orderNumber && (
                    <Link to={`/orders/${quote.orderNumber}`} className="btn-secondary">
                      View Order
                    </Link>
                  )}
                  
                  {['PENDING', 'SUPPLIER_RESPONDED', 'NEGOTIATING'].includes(quote.status) && (
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelQuote(quote.quoteNumber)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotesList
