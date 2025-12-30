import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { disputeAPI } from '../services/api'
import '../styles/DisputeManagement.css'

function DisputeManagement() {
  const navigate = useNavigate()
  const { user, isSupplier } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [submitting, setSubmitting] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!isSupplier) {
      navigate('/')
      return
    }
    fetchData()
  }, [user, isSupplier])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [disputesRes, statsRes] = await Promise.all([
        disputeAPI.getSupplierDisputes(),
        disputeAPI.getSupplierStats()
      ])

      if (disputesRes.success && disputesRes.data?.data) {
        setDisputes(disputesRes.data.data)
      }
      if (statsRes.success && statsRes.data?.data) {
        setStats(statsRes.data.data)
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilteredDisputes = () => {
    if (filter === 'ALL') return disputes
    if (filter === 'NEEDS_ACTION') {
      return disputes.filter(d => 
        d.status === 'OPEN' || 
        d.status === 'ESCALATED' || 
        d.isOverdueForAcknowledgment
      )
    }
    if (filter === 'OVERDUE') {
      return disputes.filter(d => d.isOverdueForAcknowledgment || d.isOverdueForResolution)
    }
    return disputes.filter(d => d.status === filter)
  }

  const handleQuickAcknowledge = async (ticketNumber) => {
    setSubmitting(prev => ({ ...prev, [ticketNumber]: true }))
    try {
      const result = await disputeAPI.acknowledge(ticketNumber)
      if (result.success) {
        fetchData()
      } else {
        alert(result.message || 'Failed to acknowledge')
      }
    } catch (err) {
      alert('Error acknowledging dispute')
    } finally {
      setSubmitting(prev => ({ ...prev, [ticketNumber]: false }))
    }
  }

  const filteredDisputes = getFilteredDisputes()

  if (loading) {
    return <div className="dispute-management-page"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="dispute-management-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Dispute Management</h1>
          <p>Manage customer disputes and grievances</p>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="stats-dashboard">
            <div className="stat-card total">
              <div className="stat-number">{stats.totalDisputes || 0}</div>
              <div className="stat-label">Total Disputes</div>
            </div>
            <div className="stat-card open">
              <div className="stat-number">{stats.openDisputes || 0}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-number">{stats.overdueDisputes || 0}</div>
              <div className="stat-label">Overdue</div>
            </div>
            <div className="stat-card escalated">
              <div className="stat-number">{stats.escalatedDisputes || 0}</div>
              <div className="stat-label">Escalated</div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-number">{stats.resolvedThisMonth || 0}</div>
              <div className="stat-label">Resolved (Month)</div>
            </div>
            <div className="stat-card rate">
              <div className="stat-number">{stats.avgResolutionDays || 0}</div>
              <div className="stat-label">Avg Days to Resolve</div>
            </div>
          </div>
        )}

        {/* Compliance Alert */}
        {stats?.overdueDisputes > 0 && (
          <div className="compliance-alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Compliance Warning:</strong> You have {stats.overdueDisputes} overdue dispute(s). 
              Per Indian E-Commerce Rules 2020, disputes must be acknowledged within 48 hours and 
              resolved within 30 days.
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'ALL' ? 'active' : ''} 
            onClick={() => setFilter('ALL')}
          >
            All ({disputes.length})
          </button>
          <button 
            className={filter === 'NEEDS_ACTION' ? 'active' : ''} 
            onClick={() => setFilter('NEEDS_ACTION')}
          >
            🔔 Needs Action ({disputes.filter(d => 
              d.status === 'OPEN' || d.status === 'ESCALATED' || d.isOverdueForAcknowledgment
            ).length})
          </button>
          <button 
            className={filter === 'OPEN' ? 'active' : ''} 
            onClick={() => setFilter('OPEN')}
          >
            Open ({disputes.filter(d => d.status === 'OPEN').length})
          </button>
          <button 
            className={filter === 'ESCALATED' ? 'active' : ''} 
            onClick={() => setFilter('ESCALATED')}
          >
            Escalated ({disputes.filter(d => d.status === 'ESCALATED').length})
          </button>
          <button 
            className={filter === 'OVERDUE' ? 'active' : ''} 
            onClick={() => setFilter('OVERDUE')}
          >
            Overdue ({disputes.filter(d => d.isOverdueForAcknowledgment || d.isOverdueForResolution).length})
          </button>
          <button 
            className={filter === 'RESOLVED' ? 'active' : ''} 
            onClick={() => setFilter('RESOLVED')}
          >
            Resolved ({disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length})
          </button>
        </div>

        {/* Disputes Table */}
        {filteredDisputes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No disputes found</h3>
            <p>
              {filter === 'ALL' 
                ? "You don't have any disputes yet" 
                : `No disputes matching the "${filter}" filter`}
            </p>
          </div>
        ) : (
          <div className="disputes-table-container">
            <table className="disputes-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map(dispute => (
                  <tr 
                    key={dispute.ticketNumber} 
                    className={`
                      ${dispute.isOverdueForAcknowledgment || dispute.isOverdueForResolution ? 'overdue-row' : ''}
                      ${dispute.status === 'ESCALATED' ? 'escalated-row' : ''}
                    `}
                  >
                    <td>
                      <Link to={`/disputes/${dispute.ticketNumber}`} className="ticket-link">
                        {dispute.ticketNumber}
                      </Link>
                    </td>
                    <td className="subject-cell">
                      <div className="subject">{dispute.subject}</div>
                      {dispute.escalationLevel > 0 && (
                        <span className="escalation-tag">⬆️ Level {dispute.escalationLevel}</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/supplier/orders/${dispute.orderNumber}`} className="order-link">
                        {dispute.orderNumber}
                      </Link>
                    </td>
                    <td>{dispute.buyerName}</td>
                    <td>
                      <span className="type-badge">{dispute.disputeTypeLabel}</span>
                    </td>
                    <td>
                      <span className={`priority-badge priority-${dispute.priority?.toLowerCase()}`}>
                        {dispute.priorityLabel}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(dispute.status)}`}>
                        {dispute.statusLabel}
                      </span>
                    </td>
                    <td>{formatDate(dispute.createdAt)}</td>
                    <td className="deadline-cell">
                      {dispute.daysToResolve !== undefined && !['RESOLVED', 'CLOSED'].includes(dispute.status) ? (
                        <span className={`days-left ${dispute.daysToResolve <= 5 ? 'urgent' : ''}`}>
                          {dispute.daysToResolve} days
                        </span>
                      ) : (
                        <span className="completed">✓</span>
                      )}
                      {dispute.isOverdueForAcknowledgment && (
                        <span className="overdue-tag">48hr Overdue!</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      {dispute.status === 'OPEN' && !dispute.acknowledgedAt && (
                        <button 
                          className="btn-quick-ack"
                          onClick={() => handleQuickAcknowledge(dispute.ticketNumber)}
                          disabled={submitting[dispute.ticketNumber]}
                        >
                          {submitting[dispute.ticketNumber] ? '...' : '✓ Ack'}
                        </button>
                      )}
                      <Link to={`/disputes/${dispute.ticketNumber}`} className="btn-view">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <h3>⚖️ Indian E-Commerce Compliance Guidelines</h3>
          <div className="guidelines">
            <div className="guideline">
              <span className="icon">⏱️</span>
              <div>
                <strong>48-Hour Acknowledgment</strong>
                <p>All disputes must be acknowledged within 48 hours of receipt</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">📅</span>
              <div>
                <strong>30-Day Resolution</strong>
                <p>Disputes must be resolved within 30 days per Consumer Protection Act 2019</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">👤</span>
              <div>
                <strong>Grievance Officer</strong>
                <p>Escalated disputes (Level 3) are handled by designated Grievance Officer</p>
              </div>
            </div>
            <div className="guideline">
              <span className="icon">💰</span>
              <div>
                <strong>Refund Processing</strong>
                <p>Approved refunds must be processed within 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisputeManagement
