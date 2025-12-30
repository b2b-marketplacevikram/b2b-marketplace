import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { quoteAPI } from '../../services/api'
import '../../styles/QuoteManagement.css'

function QuoteManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchQuotes()
    fetchStats()
  }, [user, filter])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const status = filter !== 'ALL' ? filter : null
      const result = await quoteAPI.getSupplierQuotesById(user?.supplierId || user?.id, status)
      
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

  const fetchStats = async () => {
    try {
      const result = await quoteAPI.getSupplierStats(user?.supplierId || user?.id)
      if (result.success && result.data?.data) {
        setStats(result.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
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
      'PENDING': 'Needs Response',
      'SUPPLIER_RESPONDED': 'Awaiting Buyer',
      'BUYER_REVIEWING': 'Under Review',
      'NEGOTIATING': 'In Negotiation',
      'APPROVED': 'Approved',
      'CONVERTED': 'Order Placed',
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

  const handleReject = async (quoteNumber) => {
    const reason = prompt('Please enter rejection reason:')
    if (!reason) return

    try {
      const result = await quoteAPI.reject(quoteNumber, reason)
      if (result.success) {
        fetchQuotes()
        fetchStats()
      } else {
        alert(result.message || 'Failed to reject quote')
      }
    } catch (err) {
      alert('Error rejecting quote')
    }
  }

  const handleExtend = async (quoteNumber) => {
    const days = prompt('Enter additional days to extend validity:', '7')
    if (!days) return

    try {
      const result = await quoteAPI.extendValidity(quoteNumber, parseInt(days))
      if (result.success) {
        fetchQuotes()
      } else {
        alert(result.message || 'Failed to extend validity')
      }
    } catch (err) {
      alert('Error extending validity')
    }
  }

  return (
    <div className="quote-management-page">
      <div className="quote-management-container">
        <div className="page-header">
          <h1>Quote Management</h1>
          <p>Manage quote requests from buyers</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.pendingCount || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card negotiating">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <span className="stat-value">{stats.negotiatingCount || 0}</span>
              <span className="stat-label">Negotiating</span>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.approvedCount || 0}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
          <div className="stat-card converted">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-value">{stats.convertedCount || 0}</span>
              <span className="stat-label">Converted</span>
            </div>
          </div>
          <div className="stat-card expiring">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <span className="stat-value">{stats.expiringSoon || 0}</span>
              <span className="stat-label">Expiring Soon</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'ALL' ? 'active' : ''} 
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button 
            className={filter === 'PENDING' ? 'active' : ''} 
            onClick={() => setFilter('PENDING')}
          >
            Needs Response
            {stats.pendingCount > 0 && <span className="badge">{stats.pendingCount}</span>}
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
            Approved
          </button>
          <button 
            className={filter === 'CONVERTED' ? 'active' : ''} 
            onClick={() => setFilter('CONVERTED')}
          >
            Converted
          </button>
        </div>

        {/* Quotes Table */}
        {loading ? (
          <div className="loading">Loading quotes...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : quotes.length === 0 ? (
          <div className="no-quotes">
            <div className="empty-icon">📋</div>
            <h2>No quotes found</h2>
            <p>No quote requests match your current filter</p>
          </div>
        ) : (
          <div className="quotes-table-container">
            <table className="quotes-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Buyer</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id} className={quote.status === 'PENDING' ? 'highlight' : ''}>
                    <td>
                      <Link to={`/supplier/quotes/${quote.quoteNumber}`} className="quote-link">
                        {quote.quoteNumber}
                      </Link>
                    </td>
                    <td>
                      <div className="buyer-info">
                        <span className="buyer-name">{quote.buyerName || 'Buyer'}</span>
                        <span className="buyer-company">{quote.buyerCompany}</span>
                      </div>
                    </td>
                    <td>
                      <div className="products-preview">
                        {quote.items?.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="product-tag">{item.productName}</span>
                        ))}
                        {quote.items?.length > 2 && (
                          <span className="more-tag">+{quote.items.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="amount-info">
                        <span className="original">₹{quote.originalTotal?.toLocaleString('en-IN')}</span>
                        {quote.finalTotal && (
                          <span className="final">₹{quote.finalTotal?.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td>
                      <span className={quote.isExpired ? 'expired-date' : ''}>
                        {formatDate(quote.validUntil)}
                      </span>
                      {!quote.isExpired && quote.daysRemaining <= 3 && (
                        <span className="expiring-warning">⚠️</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/supplier/quotes/${quote.quoteNumber}`} 
                          className="btn-action btn-view"
                        >
                          {quote.status === 'PENDING' ? 'Respond' : 'View'}
                        </Link>
                        
                        {['PENDING', 'NEGOTIATING', 'SUPPLIER_RESPONDED'].includes(quote.status) && (
                          <>
                            <button 
                              className="btn-action btn-extend"
                              onClick={() => handleExtend(quote.quoteNumber)}
                              title="Extend Validity"
                            >
                              ⏰
                            </button>
                            <button 
                              className="btn-action btn-reject"
                              onClick={() => handleReject(quote.quoteNumber)}
                              title="Reject Quote"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteManagement
