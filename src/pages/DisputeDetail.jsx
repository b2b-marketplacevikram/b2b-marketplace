import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { disputeAPI } from '../services/api'
import '../styles/DisputeDetail.css'

function DisputeDetail() {
  const { ticketNumber } = useParams()
  const navigate = useNavigate()
  const { user, isBuyer, isSupplier } = useAuth()
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showResolutionForm, setShowResolutionForm] = useState(false)
  const [resolutionData, setResolutionData] = useState({
    proposedResolution: '',
    proposedRefundAmount: '',
    message: ''
  })
  
  // Modal states
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [escalateReason, setEscalateReason] = useState('')
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [acceptData, setAcceptData] = useState({ rating: 5, feedback: '' })
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showSupplierRefundModal, setShowSupplierRefundModal] = useState(false)
  const [refundProofFile, setRefundProofFile] = useState(null)
  const [uploadingRefundProof, setUploadingRefundProof] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'info' })
  const [refundTransactionData, setRefundTransactionData] = useState({
    transactionId: '', bankName: '', transactionDate: '', proofUrl: '', notes: ''
  })

  const showConfirmModal = (title, message, onConfirm, type = 'info') => {
    setConfirmModal({ show: true, title, message, onConfirm, type })
  }
  const hideConfirmModal = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'info' })
  }
  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) { confirmModal.onConfirm() }
    hideConfirmModal()
  }
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000)
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDispute()
  }, [user, ticketNumber])

  const fetchDispute = async () => {
    try {
      setLoading(true)
      const result = await disputeAPI.getByTicketNumber(ticketNumber)
      if (result.success && result.data?.data) {
        setDispute(result.data.data)
      } else {
        setError('Dispute not found')
      }
    } catch (err) {
      console.error('Failed to fetch dispute:', err)
      setError('Failed to load dispute')
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
      'CLOSED': 'status-closed'
    }
    return classes[status] || 'status-open'
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

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSubmitting(true)
    try {
      const result = await disputeAPI.addMessage(ticketNumber, {
        senderId: user.id,
        senderName: user.name || user.username,
        senderType: isBuyer ? 'BUYER' : 'SUPPLIER',
        message: message
      })
      if (result.success) {
        setMessage('')
        fetchDispute()
      } else {
        alert(result.message || 'Failed to send message')
      }
    } catch (err) {
      alert('Error sending message')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcknowledge = async () => {
    setSubmitting(true)
    try {
      const result = await disputeAPI.acknowledge(ticketNumber)
      if (result.success) {
        fetchDispute()
      } else {
        alert(result.message || 'Failed to acknowledge')
      }
    } catch (err) {
      alert('Error acknowledging dispute')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitResolution = async () => {
    if (!resolutionData.message.trim()) {
      alert('Please enter a message')
      return
    }

    setSubmitting(true)
    try {
      const result = await disputeAPI.respond(ticketNumber, {
        message: resolutionData.message,
        proposedResolution: resolutionData.proposedResolution || null,
        proposedRefundAmount: resolutionData.proposedRefundAmount ? 
          parseFloat(resolutionData.proposedRefundAmount) : null
      })
      if (result.success) {
        setShowResolutionForm(false)
        setResolutionData({ proposedResolution: '', proposedRefundAmount: '', message: '' })
        fetchDispute()
      } else {
        showToast(result.message || 'Failed to submit response', 'error')
      }
    } catch (err) {
      showToast('Error submitting response', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      showToast('Please provide a reason for escalation', 'error')
      return
    }

    setSubmitting(true)
    try {
      const result = await disputeAPI.escalate(ticketNumber, escalateReason)
      if (result.success) {
        setShowEscalateModal(false)
        setEscalateReason('')
        fetchDispute()
        showToast('Dispute escalated to ' + result.data?.data?.escalationLevelLabel, 'success')
      } else {
        showToast(result.message || 'Failed to escalate', 'error')
      }
    } catch (err) {
      showToast('Error escalating dispute', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptResolution = async () => {
    if (acceptData.rating < 1 || acceptData.rating > 5) {
      showToast('Please select a rating between 1 and 5', 'error')
      return
    }

    setSubmitting(true)
    try {
      const result = await disputeAPI.acceptResolution(ticketNumber, acceptData.rating, acceptData.feedback)
      if (result.success) {
        setShowAcceptModal(false)
        setAcceptData({ rating: 5, feedback: '' })
        fetchDispute()
        showToast('Resolution accepted. Dispute resolved!', 'success')
      } else {
        showToast(result.message || 'Failed to accept resolution', 'error')
      }
    } catch (err) {
      showToast('Error accepting resolution', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async () => {
    setSubmitting(true)
    try {
      const result = await disputeAPI.close(ticketNumber)
      if (result.success) {
        fetchDispute()
        showToast('Dispute closed successfully', 'success')
      } else {
        showToast(result.message || 'Failed to close dispute', 'error')
      }
    } catch (err) {
      showToast('Error closing dispute', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmRefund = async () => {
    if (!window.confirm('Have you received the refund in your bank account?')) {
      return
    }

    setSubmitting(true)
    try {
      const result = await disputeAPI.confirmRefundReceived(ticketNumber)
      if (result.success) {
        fetchDispute()
        showToast('Refund confirmed successfully. Dispute resolved!', 'success')
      } else {
        showToast(result.message || 'Failed to confirm refund', 'error')
      }
    } catch (err) {
      showToast('Error confirming refund', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefundProofUpload = async (file) => {
    if (!file) return null

    try {
      setUploadingRefundProof(true)
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResult = await disputeAPI.uploadRefundProof(formData)
      
      if (uploadResult.success) {
        return `http://localhost:8083${uploadResult.url}`
      } else {
        showToast(uploadResult.message || 'Failed to upload proof', 'error')
        return null
      }
    } catch (error) {
      showToast('Error uploading proof', 'error')
      return null
    } finally {
      setUploadingRefundProof(false)
    }
  }

  const handleSubmitRefundTransaction = async () => {
    if (!refundTransactionData.transactionId.trim()) {
      showToast('Please enter transaction ID', 'error')
      return
    }

    if (!refundTransactionData.bankName.trim()) {
      showToast('Please enter bank name', 'error')
      return
    }

    if (!refundProofFile) {
      showToast('Please upload payment proof', 'error')
      return
    }

    setSubmitting(true)
    try {
      // Upload proof first
      const proofUrl = await handleRefundProofUpload(refundProofFile)
      if (!proofUrl) {
        setSubmitting(false)
        return
      }

      // Submit refund transaction
      const result = await disputeAPI.submitRefundTransaction(ticketNumber, {
        ...refundTransactionData,
        proofUrl: proofUrl,
        transactionDate: refundTransactionData.transactionDate || new Date().toISOString()
      })

      if (result.success) {
        setShowSupplierRefundModal(false)
        setRefundTransactionData({
          transactionId: '', bankName: '', transactionDate: '', proofUrl: '', notes: ''
        })
        setRefundProofFile(null)
        fetchDispute()
        showToast('Refund transaction submitted successfully!', 'success')
      } else {
        showToast(result.message || 'Failed to submit refund transaction', 'error')
      }
    } catch (err) {
      showToast('Error submitting refund transaction', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resolutionTypes = [
    { value: 'FULL_REFUND', label: 'Full Refund' },
    { value: 'PARTIAL_REFUND', label: 'Partial Refund' },
    { value: 'REPLACEMENT', label: 'Product Replacement' },
    { value: 'REPAIR', label: 'Product Repair' },
    { value: 'CREDIT_NOTE', label: 'Store Credit' },
    { value: 'REDELIVERY', label: 'Re-delivery' },
    { value: 'EXPLANATION', label: 'Explanation Provided' }
  ]

  if (loading) {
    return <div className="dispute-detail-page"><div className="loading">Loading...</div></div>
  }

  if (error) {
    return <div className="dispute-detail-page"><div className="error-message">{error}</div></div>
  }

  if (!dispute) {
    return <div className="dispute-detail-page"><div className="error-message">Dispute not found</div></div>
  }

  return (
    <div className="dispute-detail-page">
      <div className="dispute-detail-container">
        {/* Header */}
        <div className="dispute-header">
          <div className="header-left">
            <Link to={isBuyer ? '/disputes' : '/supplier/disputes'} className="back-link">
              ← Back to Tickets
            </Link>
            <h1>Ticket {dispute.ticketNumber}</h1>
            <div className="badges">
              <span className={`status-badge ${getStatusClass(dispute.status)}`}>
                {dispute.statusLabel}
              </span>
              <span className={`priority-badge priority-${dispute.priority?.toLowerCase()}`}>
                {dispute.priorityLabel}
              </span>
              {dispute.escalationLevel > 0 && (
                <span className="escalation-badge">
                  ⬆️ {dispute.escalationLevelLabel}
                </span>
              )}
            </div>
          </div>
          <div className="header-right">
            {dispute.daysToResolve !== undefined && !['RESOLVED', 'CLOSED'].includes(dispute.status) && (
              <div className={`days-counter ${dispute.daysToResolve <= 5 ? 'urgent' : ''}`}>
                <span className="count">{dispute.daysToResolve}</span>
                <span className="label">Days to Resolve</span>
              </div>
            )}
          </div>
        </div>

        <div className="dispute-content">
          {/* Main Content */}
          <div className="main-section">
            {/* Dispute Info */}
            <div className="info-card">
              <h2>{dispute.subject}</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Order:</span>
                  <Link to={`/orders/${dispute.orderNumber}`} className="value link">
                    {dispute.orderNumber}
                  </Link>
                </div>
                <div className="info-item">
                  <span className="label">Type:</span>
                  <span className="value">{dispute.disputeTypeLabel}</span>
                </div>
                <div className="info-item">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(dispute.createdAt)}</span>
                </div>
                {dispute.acknowledgedAt && (
                  <div className="info-item">
                    <span className="label">Acknowledged:</span>
                    <span className="value">{formatDate(dispute.acknowledgedAt)}</span>
                  </div>
                )}
              </div>

              <div className="description-section">
                <h3>Description</h3>
                <p>{dispute.description}</p>
              </div>

              {/* Evidence */}
              {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                <div className="evidence-section">
                  <h3>Evidence Attached</h3>
                  <div className="evidence-grid">
                    {dispute.evidenceUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="evidence-item">
                        📎 Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refund Info */}
            {dispute.refundRequested && (
              <div className="refund-card">
                <h3>💰 Refund Request</h3>
                <div className="refund-details">
                  <div className="refund-amount">
                    <span className="label">Amount:</span>
                    <span className="value">₹{dispute.refundAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="refund-status">
                    <span className="label">Status:</span>
                    <span className={`status ${dispute.refundStatus?.toLowerCase()}`}>
                      {dispute.refundStatusLabel}
                    </span>
                  </div>
                </div>

                {/* Refund Transaction Details - Show payment proof */}
                {dispute.refundTransaction && (
                  <div className="refund-transaction" style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    borderLeft: '4px solid #43a047'
                  }}>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 12px', color: '#1b5e20' }}>
                      📋 Refund Transaction Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '4px' }}>Transaction ID:</span>
                        <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{dispute.refundTransaction.transactionId}</span>
                      </div>
                      {dispute.refundTransaction.bankName && (
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '4px' }}>Bank:</span>
                          <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{dispute.refundTransaction.bankName}</span>
                        </div>
                      )}
                      {dispute.refundTransaction.transactionDate && (
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '4px' }}>Date:</span>
                          <span style={{ fontWeight: '600', color: '#1a1a2e' }}>
                            {formatDate(dispute.refundTransaction.transactionDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Payment Proof Screenshot */}
                    {dispute.refundTransaction.proofUrl && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e0e0e0' }}>
                        <h5 style={{ fontSize: '0.9rem', margin: '0 0 10px', color: '#1b5e20' }}>
                          💳 Payment Proof:
                        </h5>
                        <a 
                          href={dispute.refundTransaction.proofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            marginBottom: '10px'
                          }}
                        >
                          📸 View Payment Screenshot
                        </a>
                        <div style={{ marginTop: '10px' }}>
                          <img 
                            src={dispute.refundTransaction.proofUrl}
                            alt="Refund Payment Proof"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(dispute.refundTransaction.proofUrl, '_blank')}
                          />
                        </div>
                      </div>
                    )}

                    {dispute.refundTransaction.notes && (
                      <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#666' }}>
                        <strong>Supplier Notes:</strong> {dispute.refundTransaction.notes}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Buyer can confirm refund received when status is PROCESSING */}
                {isBuyer && dispute.refundStatus === 'PROCESSING' && (
                  <div className="refund-actions" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e9ecef' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
                      ℹ️ Once you receive the refund in your bank account, please confirm below to close this dispute.
                    </p>
                    <button 
                      className="btn-accept" 
                      onClick={handleConfirmRefund} 
                      disabled={submitting}
                      style={{ width: '100%' }}
                    >
                      {submitting ? 'Confirming...' : '✓ I Received the Refund'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resolution Proposed */}
            {dispute.resolutionType && (
              <div className="resolution-card">
                <h3>✅ Proposed Resolution</h3>
                <div className="resolution-type">{dispute.resolutionTypeLabel}</div>
                {dispute.resolutionNotes && <p className="resolution-notes">{dispute.resolutionNotes}</p>}
                
                {isBuyer && dispute.status === 'RESOLUTION_PROPOSED' && (
                  <div className="resolution-actions">
                    <button className="btn-accept" onClick={() => setShowAcceptModal(true)} disabled={submitting}>
                      ✓ Accept Resolution
                    </button>
                    <button className="btn-escalate" onClick={() => setShowEscalateModal(true)} disabled={submitting}>
                      ⬆️ Escalate
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Supplier Resolution Form */}
            {isSupplier && showResolutionForm && (
              <div className="resolution-form-card">
                <h3>Propose Resolution</h3>
                <div className="form-group">
                  <label>Resolution Type</label>
                  <select
                    value={resolutionData.proposedResolution}
                    onChange={(e) => setResolutionData({ ...resolutionData, proposedResolution: e.target.value })}
                  >
                    <option value="">Select resolution type (optional)</option>
                    {resolutionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {['FULL_REFUND', 'PARTIAL_REFUND'].includes(resolutionData.proposedResolution) && (
                  <div className="form-group">
                    <label>Refund Amount (₹)</label>
                    <input
                      type="number"
                      value={resolutionData.proposedRefundAmount}
                      onChange={(e) => setResolutionData({ ...resolutionData, proposedRefundAmount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={resolutionData.message}
                    onChange={(e) => setResolutionData({ ...resolutionData, message: e.target.value })}
                    placeholder="Explain your response..."
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setShowResolutionForm(false)}>Cancel</button>
                  <button className="btn-submit" onClick={handleSubmitResolution} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="messages-card">
              <h3>💬 Communication Thread ({dispute.messages?.length || 0})</h3>
              <div className="messages-list">
                {dispute.messages?.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.senderType?.toLowerCase()}`}>
                    <div className="message-header">
                      <span className="sender">{msg.senderName}</span>
                      <span className="sender-type">{msg.senderType}</span>
                      <span className="time">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="message-body">{msg.message}</p>
                    {msg.messageType !== 'TEXT' && (
                      <span className="message-type-badge">{msg.messageType}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {!['RESOLVED', 'CLOSED'].includes(dispute.status) && (
                <div className="message-input">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows="3"
                  />
                  <button onClick={handleSendMessage} disabled={submitting || !message.trim()}>
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Parties */}
            <div className="parties-card">
              <div className="party">
                <h4>Buyer</h4>
                <p className="name">{dispute.buyerName}</p>
                <p className="contact">{dispute.buyerEmail}</p>
                <p className="contact">{dispute.buyerPhone}</p>
              </div>
              <div className="party">
                <h4>Supplier</h4>
                <p className="name">{dispute.supplierName}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-card">
              <h4>Actions</h4>

              {/* Supplier Actions */}
              {isSupplier && (
                <>
                  {dispute.status === 'OPEN' && !dispute.acknowledgedAt && (
                    <button className="btn-acknowledge" onClick={handleAcknowledge} disabled={submitting}>
                      ✓ Acknowledge (48hr deadline)
                    </button>
                  )}
                  {['OPEN', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'ESCALATED'].includes(dispute.status) && (
                    <button className="btn-respond" onClick={() => setShowResolutionForm(true)}>
                      📝 Respond / Propose Resolution
                    </button>
                  )}
                  {dispute.status === 'RESOLVED' && dispute.refundStatus === 'PROCESSING' && !dispute.refundTransaction && (
                    <button 
                      className="btn-submit-refund" 
                      onClick={() => navigate(`/supplier/refund/${ticketNumber}`, { state: { dispute } })}
                    >
                      💸 Submit Refund Transaction
                    </button>
                  )}
                </>
              )}

              {/* Buyer Actions */}
              {isBuyer && (
                <>
                  {['SUPPLIER_RESPONDED', 'UNDER_REVIEW'].includes(dispute.status) && 
                   !dispute.resolutionType && dispute.escalationLevel < 3 && (
                    <button className="btn-escalate" onClick={() => setShowEscalateModal(true)} disabled={submitting}>
                      ⬆️ Escalate Dispute
                    </button>
                  )}
                  {dispute.status === 'RESOLUTION_PROPOSED' && (
                    <button className="btn-accept" onClick={() => setShowAcceptModal(true)} disabled={submitting}>
                      ✓ Accept Resolution
                    </button>
                  )}
                  {dispute.status === 'RESOLVED' && (
                    <button className="btn-close" onClick={handleClose} disabled={submitting}>
                      Close Ticket
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline-card">
              <h4>Timeline</h4>
              <div className="timeline">
                <div className="timeline-item">
                  <span className="icon">📋</span>
                  <div className="info">
                    <span className="label">Created</span>
                    <span className="date">{formatDate(dispute.createdAt)}</span>
                  </div>
                </div>
                {dispute.acknowledgedAt && (
                  <div className="timeline-item">
                    <span className="icon">✓</span>
                    <div className="info">
                      <span className="label">Acknowledged</span>
                      <span className="date">{formatDate(dispute.acknowledgedAt)}</span>
                    </div>
                  </div>
                )}
                {dispute.escalatedAt && (
                  <div className="timeline-item">
                    <span className="icon">⬆️</span>
                    <div className="info">
                      <span className="label">Escalated</span>
                      <span className="date">{formatDate(dispute.escalatedAt)}</span>
                    </div>
                  </div>
                )}
                {dispute.resolvedAt && (
                  <div className="timeline-item">
                    <span className="icon">✅</span>
                    <div className="info">
                      <span className="label">Resolved</span>
                      <span className="date">{formatDate(dispute.resolvedAt)}</span>
                    </div>
                  </div>
                )}
                {dispute.closedAt && (
                  <div className="timeline-item">
                    <span className="icon">🔒</span>
                    <div className="info">
                      <span className="label">Closed</span>
                      <span className="date">{formatDate(dispute.closedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Info */}
            <div className="compliance-card">
              <h4>⚖️ Compliance</h4>
              <div className="compliance-item">
                <span className="label">Acknowledgment Deadline:</span>
                <span className={`value ${dispute.isOverdueForAcknowledgment ? 'overdue' : ''}`}>
                  {formatDate(dispute.acknowledgmentDeadline)}
                  {dispute.isOverdueForAcknowledgment && ' (OVERDUE)'}
                </span>
              </div>
              <div className="compliance-item">
                <span className="label">Resolution Deadline:</span>
                <span className={`value ${dispute.isOverdueForResolution ? 'overdue' : ''}`}>
                  {formatDate(dispute.resolutionDeadline)}
                  {dispute.isOverdueForResolution && ' (OVERDUE)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-content">
            <p className="toast-message">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>×</button>
        </div>
      )}

      {/* Accept Resolution Modal */}
      {showAcceptModal && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Accept Resolution</h2>
              <button className="close-btn" onClick={() => setShowAcceptModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="rating-section">
                <label>Rate the resolution</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${acceptData.rating >= star ? 'active' : ''}`}
                      onClick={() => setAcceptData({ ...acceptData, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-text">
                  {acceptData.rating === 1 && 'Poor'}
                  {acceptData.rating === 2 && 'Fair'}
                  {acceptData.rating === 3 && 'Good'}
                  {acceptData.rating === 4 && 'Very Good'}
                  {acceptData.rating === 5 && 'Excellent'}
                </span>
              </div>
              <div className="form-group">
                <label>Feedback (optional)</label>
                <textarea
                  value={acceptData.feedback}
                  onChange={(e) => setAcceptData({ ...acceptData, feedback: e.target.value })}
                  placeholder="Share your experience with how this dispute was handled..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAcceptModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-submit btn-success" 
                onClick={handleAcceptResolution}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Accept & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Refund Transaction Modal */}
      {showSupplierRefundModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierRefundModal(false)}>
          <div className="modal-content refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💸 Submit Refund Transaction</h2>
              <button className="close-btn" onClick={() => setShowSupplierRefundModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Enter the details of the refund transaction you've processed for this dispute.
              </p>

              <div className="form-group">
                <label>Transaction ID / Reference Number *</label>
                <input
                  type="text"
                  value={refundTransactionData.transactionId}
                  onChange={(e) => setRefundTransactionData({ ...refundTransactionData, transactionId: e.target.value })}
                  placeholder="Enter transaction ID or UTR number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={refundTransactionData.bankName}
                  onChange={(e) => setRefundTransactionData({ ...refundTransactionData, bankName: e.target.value })}
                  placeholder="Enter your bank name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Transaction Date</label>
                <input
                  type="datetime-local"
                  value={refundTransactionData.transactionDate}
                  onChange={(e) => setRefundTransactionData({ ...refundTransactionData, transactionDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Proof / Screenshot *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefundProofFile(e.target.files[0])}
                  required
                />
                {refundProofFile && (
                  <div style={{ marginTop: '10px', color: '#16a085' }}>
                    ✓ Selected: {refundProofFile.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={refundTransactionData.notes}
                  onChange={(e) => setRefundTransactionData({ ...refundTransactionData, notes: e.target.value })}
                  placeholder="Any additional notes about the refund..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowSupplierRefundModal(false)}
                disabled={submitting || uploadingRefundProof}
              >
                Cancel
              </button>
              <button 
                className="btn-submit btn-success" 
                onClick={handleSubmitRefundTransaction}
                disabled={submitting || uploadingRefundProof}
              >
                {submitting ? 'Submitting...' : uploadingRefundProof ? 'Uploading...' : 'Submit Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="modal-overlay" onClick={() => setShowEscalateModal(false)}>
          <div className="modal-content escalate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <h2>⬆️ Escalate Dispute</h2>
              <button className="close-btn" onClick={() => setShowEscalateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="escalation-info">
                <p>
                  Escalating will raise this dispute to the next level for priority handling.
                  Current level: <strong>Level {dispute?.escalationLevel || 0}</strong>
                </p>
              </div>
              <div className="form-group">
                <label>Reason for Escalation *</label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Please explain why you're escalating this dispute..."
                  rows="4"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEscalateModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-submit btn-warning" 
                onClick={handleEscalate}
                disabled={submitting || !escalateReason.trim()}
              >
                {submitting ? 'Escalating...' : 'Escalate Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}{/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="confirm-modal-overlay" onClick={hideConfirmModal}>
          <div className={`confirm-modal-content confirm-modal-${confirmModal.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              {confirmModal.type === 'success' && <span className="icon-success">OK</span>}
              {confirmModal.type === 'warning' && <span className="icon-warning">!</span>}
              {confirmModal.type === 'info' && <span className="icon-info">i</span>}
            </div>
            <h3 className="confirm-modal-title">{confirmModal.title}</h3>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <div className="confirm-modal-buttons">
              <button className="btn-confirm-cancel" onClick={hideConfirmModal}>Cancel</button>
              <button className={`btn-confirm-action btn-${confirmModal.type}`} onClick={handleConfirmAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DisputeDetail
