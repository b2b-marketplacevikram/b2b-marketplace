import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { disputeAPI } from '../../services/api'
import '../../styles/DisputeList.css'

function DisputeList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDisputes()
  }, [user, filter])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const status = filter !== 'ALL' ? filter : null
      const result = await disputeAPI.getBuyerDisputes(status)
      if (result.success && result.data?.data) {
        setDisputes(result.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    const classes = {
      'OPEN': 'status-open',
      'ACKNOWLEDGED': 'status-acknowledged',
      'UNDER_REVIEW': 'status-review',
      'SUPPLIER_RESPONDED': 'status-responded',
      'AWAITING_BUYER': 'status-awaiting',
      'ESCALATED': 'status-escalated',
      'RESOLUTION_PROPOSED': 'status-proposed',
      'RESOLVED': 'status-resolved',
      'CLOSED': 'status-closed',
      'REOPENED': 'status-reopened'
    }
    return classes[status] || 'status-open'
  }

  const getPriorityClass = (priority) => {
    const classes = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent'
    }
    return classes[priority] || 'priority-medium'
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

  const filterTabs = [
    { key: 'ALL', label: 'All Tickets' },
    { key: 'OPEN', label: 'Open' },
    { key: 'ESCALATED', label: 'Escalated' },
    { key: 'RESOLUTION_PROPOSED', label: 'Resolution Proposed' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' }
  ]

  return (
    <div className="dispute-list-page">
      <div className="dispute-list-container">
        <div className="page-header">
          <div className="header-content">
            <h1>🎫 My Support Tickets</h1>
            <p className="subtitle">Track and manage your order disputes</p>
          </div>
          <Link to="/orders" className="btn-view-orders">
            View Orders
          </Link>
        </div>

        {/* Compliance Notice */}
        <div className="compliance-notice">
          <div className="notice-icon">⚖️</div>
          <div className="notice-content">
            <h4>Consumer Protection Guarantee</h4>
            <p>As per Consumer Protection (E-Commerce) Rules 2020, all grievances will be acknowledged within 48 hours and resolved within 30 days.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              className={`tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : disputes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No Tickets Found</h3>
            <p>You haven't raised any support tickets yet.</p>
            <Link to="/orders" className="btn-primary">Go to Orders</Link>
          </div>
        ) : (
          <div className="disputes-list">
            {disputes.map(dispute => (
              <div key={dispute.id} className="dispute-card">
                <div className="dispute-header">
                  <div className="ticket-info">
                    <span className="ticket-number">{dispute.ticketNumber}</span>
                    <span className={`status-badge ${getStatusClass(dispute.status)}`}>
                      {dispute.statusLabel}
                    </span>
                    <span className={`priority-badge ${getPriorityClass(dispute.priority)}`}>
                      {dispute.priorityLabel}
                    </span>
                    {dispute.escalationLevel > 0 && (
                      <span className="escalation-badge">
                        ⬆️ Level {dispute.escalationLevel}
                      </span>
                    )}
                  </div>
                  <div className="dispute-meta">
                    <span className="order-ref">Order: {dispute.orderNumber}</span>
                  </div>
                </div>

                <div className="dispute-body">
                  <h3 className="dispute-subject">{dispute.subject}</h3>
                  <p className="dispute-type">
                    <span className="type-badge">{dispute.disputeTypeLabel}</span>
                  </p>
                  <p className="dispute-description">
                    {dispute.description?.substring(0, 150)}
                    {dispute.description?.length > 150 ? '...' : ''}
                  </p>
                </div>

                <div className="dispute-footer">
                  <div className="footer-info">
                    <span className="supplier">Supplier: {dispute.supplierName}</span>
                    <span className="created">Created: {formatDate(dispute.createdAt)}</span>
                    {dispute.daysToResolve !== undefined && dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
                      <span className={`days-left ${dispute.daysToResolve <= 5 ? 'urgent' : ''}`}>
                        {dispute.daysToResolve} days to resolve
                      </span>
                    )}
                  </div>
                  <div className="footer-actions">
                    {dispute.messageCount > 0 && (
                      <span className="message-count">
                        💬 {dispute.messageCount} messages
                      </span>
                    )}
                    <Link to={`/disputes/${dispute.ticketNumber}`} className="btn-view">
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Refund Info */}
                {dispute.refundRequested && (
                  <div className="refund-info">
                    <span className="refund-label">💰 Refund:</span>
                    <span className={`refund-status ${dispute.refundStatus?.toLowerCase()}`}>
                      {dispute.refundStatusLabel}
                    </span>
                    {dispute.refundAmount && (
                      <span className="refund-amount">₹{dispute.refundAmount.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                )}

                {/* Overdue Warning */}
                {dispute.isOverdueForResolution && (
                  <div className="overdue-warning">
                    ⚠️ This dispute is overdue for resolution. You may escalate to the Grievance Officer.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DisputeList
