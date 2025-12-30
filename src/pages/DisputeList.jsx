import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { disputeAPI } from '../services/api'
import '../styles/DisputeList.css'

function DisputeList() {
  const navigate = useNavigate()
  const { user, isBuyer } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDisputes()
  }, [user])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const result = await disputeAPI.getBuyerDisputes()
      if (result.success && result.data?.data) {
        setDisputes(result.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err)
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
      'ESCALATED': 'status-escalated',
      'RESOLUTION_PROPOSED': 'status-proposed',
      'RESOLVED': 'status-resolved',
      'CLOSED': 'status-closed'
    }
    return classes[status] || 'status-open'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFilteredDisputes = () => {
    if (filter === 'ALL') return disputes
    if (filter === 'ACTIVE') {
      return disputes.filter(d => !['RESOLVED', 'CLOSED'].includes(d.status))
    }
    return disputes.filter(d => d.status === filter)
  }

  const filteredDisputes = getFilteredDisputes()

  if (loading) {
    return <div className="dispute-list-page"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="dispute-list-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>My Support Tickets</h1>
          <p>Track and manage your dispute tickets</p>
        </div>

        {/* Compliance Notice */}
        <div className="compliance-notice">
          <span className="notice-icon">⚖️</span>
          <div className="notice-content">
            <strong>Indian E-Commerce Consumer Protection:</strong>
            <p>Under Consumer Protection Act 2019 and E-Commerce Rules 2020, suppliers must acknowledge 
            your grievance within 48 hours and resolve it within 30 days.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'ALL' ? 'active' : ''} 
            onClick={() => setFilter('ALL')}
          >
            All ({disputes.length})
          </button>
          <button 
            className={filter === 'ACTIVE' ? 'active' : ''} 
            onClick={() => setFilter('ACTIVE')}
          >
            Active ({disputes.filter(d => !['RESOLVED', 'CLOSED'].includes(d.status)).length})
          </button>
          <button 
            className={filter === 'ESCALATED' ? 'active' : ''} 
            onClick={() => setFilter('ESCALATED')}
          >
            Escalated ({disputes.filter(d => d.status === 'ESCALATED').length})
          </button>
          <button 
            className={filter === 'RESOLUTION_PROPOSED' ? 'active' : ''} 
            onClick={() => setFilter('RESOLUTION_PROPOSED')}
          >
            Resolution Proposed ({disputes.filter(d => d.status === 'RESOLUTION_PROPOSED').length})
          </button>
          <button 
            className={filter === 'RESOLVED' ? 'active' : ''} 
            onClick={() => setFilter('RESOLVED')}
          >
            Resolved ({disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length})
          </button>
        </div>

        {/* Disputes List */}
        {filteredDisputes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No tickets found</h3>
            <p>
              {filter === 'ALL' 
                ? "You haven't raised any dispute tickets yet" 
                : `No tickets matching the "${filter}" filter`}
            </p>
            <Link to="/orders" className="btn-primary">View My Orders</Link>
          </div>
        ) : (
          <div className="disputes-grid">
            {filteredDisputes.map(dispute => (
              <Link 
                key={dispute.ticketNumber} 
                to={`/disputes/${dispute.ticketNumber}`}
                className="dispute-card"
              >
                <div className="card-header">
                  <span className="ticket-number">{dispute.ticketNumber}</span>
                  <span className={`status-badge ${getStatusClass(dispute.status)}`}>
                    {dispute.statusLabel}
                  </span>
                </div>

                <h3 className="subject">{dispute.subject}</h3>
                
                <div className="meta-row">
                  <span className="type-badge">{dispute.disputeTypeLabel}</span>
                  <span className={`priority-badge priority-${dispute.priority?.toLowerCase()}`}>
                    {dispute.priorityLabel}
                  </span>
                </div>

                <div className="info-row">
                  <span className="order">Order: {dispute.orderNumber}</span>
                  <span className="date">Created: {formatDate(dispute.createdAt)}</span>
                </div>

                {dispute.escalationLevel > 0 && (
                  <div className="escalation-info">
                    ⬆️ Escalated to {dispute.escalationLevelLabel}
                  </div>
                )}

                {dispute.refundRequested && (
                  <div className="refund-info">
                    💰 Refund Requested: ₹{dispute.refundAmount?.toLocaleString('en-IN')}
                    <span className={`refund-status ${dispute.refundStatus?.toLowerCase()}`}>
                      {dispute.refundStatusLabel}
                    </span>
                  </div>
                )}

                {dispute.isOverdueForResolution && (
                  <div className="overdue-warning">
                    ⚠️ Resolution Overdue
                  </div>
                )}

                <div className="card-footer">
                  <span className="days-info">
                    {dispute.daysToResolve !== undefined && !['RESOLVED', 'CLOSED'].includes(dispute.status)
                      ? `${dispute.daysToResolve} days to resolve`
                      : dispute.status === 'RESOLVED' || dispute.status === 'CLOSED'
                      ? '✓ Resolved'
                      : ''
                    }
                  </span>
                  <span className="view-link">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DisputeList
