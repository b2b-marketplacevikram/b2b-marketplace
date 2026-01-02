import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { refundAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import './RefundRequests.css'

function RefundRequests() {
  const { user } = useAuth()
  const [refunds, setRefunds] = useState([])
  const [bankDetails, setBankDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [selectedBankId, setSelectedBankId] = useState(null)
  const [buyerNotes, setBuyerNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  useEffect(() => {
    if (user?.id) {
      fetchRefunds()
      fetchBankDetails()
    }
  }, [user])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const result = await refundAPI.getBuyerRefunds(user.id)
      if (result.success) {
        setRefunds(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching refunds:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankDetails = async () => {
    try {
      const result = await refundAPI.getBuyerBankDetails(user.id)
      if (result.success) {
        setBankDetails(result.data || [])
        // Auto-select primary bank
        const primary = result.data?.find(b => b.isPrimary)
        if (primary) setSelectedBankId(primary.id)
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
    }
  }

  const handleConfirmRefund = async (refund) => {
    // For BANK_TRANSFER, ensure bank details are selected
    if (refund.refundMethod === 'BANK_TRANSFER' && !selectedBankId) {
      showToast('Please select a bank account for the refund', 'warning')
      return
    }

    try {
      setProcessing(true)
      const result = await refundAPI.confirmRefund(refund.id, {
        bankDetailsId: refund.refundMethod === 'BANK_TRANSFER' ? selectedBankId : null,
        buyerNotes: buyerNotes
      })

      if (result.success) {
        showToast('Refund confirmed successfully!', 'success')
        setSelectedRefund(null)
        setBuyerNotes('')
        fetchRefunds()
      } else {
        showToast(result.message || 'Failed to confirm refund', 'error')
      }
    } catch (error) {
      showToast('Failed to confirm refund', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectRefund = async (refund) => {
    const reason = prompt('Please provide a reason for rejecting this refund method:')
    if (!reason) return

    try {
      setProcessing(true)
      const result = await refundAPI.rejectRefund(refund.id, reason)

      if (result.success) {
        showToast('Refund method rejected. Supplier will be notified.', 'success')
        fetchRefunds()
      } else {
        showToast(result.message || 'Failed to reject refund', 'error')
      }
    } catch (error) {
      showToast('Failed to reject refund', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'status-pending', label: 'Awaiting Your Confirmation' },
      'BUYER_CONFIRMED': { class: 'status-confirmed', label: 'Confirmed - Processing' },
      'PROCESSING': { class: 'status-processing', label: 'Processing' },
      'COMPLETED': { class: 'status-completed', label: 'Completed' },
      'REJECTED': { class: 'status-rejected', label: 'Rejected' }
    }
    return statusMap[status] || { class: 'status-pending', label: status }
  }

  const getMethodLabel = (method) => {
    const methods = {
      'ORIGINAL_PAYMENT': '🔄 Original Payment Method',
      'BANK_TRANSFER': '🏦 Bank Transfer',
      'WALLET_CREDIT': '💳 Wallet Credit'
    }
    return methods[method] || method
  }

  const pendingRefunds = refunds.filter(r => r.status === 'PENDING')
  const otherRefunds = refunds.filter(r => r.status !== 'PENDING')

  if (loading) {
    return (
      <div className="refund-requests-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading refund requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="refund-requests-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <h1>💰 Refund Requests</h1>
        <p>Review and confirm refund requests from suppliers</p>
      </div>

      {pendingRefunds.length > 0 && (
        <div className="pending-section">
          <h2 className="section-title">
            <span className="pending-badge">{pendingRefunds.length}</span>
            Pending Confirmation
          </h2>
          
          <div className="refund-cards">
            {pendingRefunds.map(refund => (
              <div key={refund.id} className="refund-card pending">
                <div className="refund-card-header">
                  <div className="order-info">
                    <span className="order-number">{refund.orderNumber}</span>
                    <span className={`status-badge ${getStatusBadge(refund.status).class}`}>
                      {getStatusBadge(refund.status).label}
                    </span>
                  </div>
                  <div className="refund-amount">
                    ${parseFloat(refund.refundAmount).toFixed(2)}
                  </div>
                </div>

                <div className="refund-card-body">
                  <div className="refund-method">
                    <span className="label">Refund Method:</span>
                    <span className="value">{getMethodLabel(refund.refundMethod)}</span>
                  </div>
                  
                  <div className="refund-reason">
                    <span className="label">Reason:</span>
                    <p>{refund.reason}</p>
                  </div>

                  {refund.supplierNotes && (
                    <div className="supplier-notes">
                      <span className="label">Supplier Notes:</span>
                      <p>{refund.supplierNotes}</p>
                    </div>
                  )}

                  {/* Bank Selection for BANK_TRANSFER */}
                  {refund.refundMethod === 'BANK_TRANSFER' && (
                    <div className="bank-selection">
                      <span className="label">Select Bank Account for Refund:</span>
                      {bankDetails.length === 0 ? (
                        <div className="no-bank-warning">
                          <p>⚠️ You haven't added any bank accounts yet.</p>
                          <Link to="/buyer/bank-details" className="add-bank-link">
                            + Add Bank Account
                          </Link>
                        </div>
                      ) : (
                        <div className="bank-options">
                          {bankDetails.map(bank => (
                            <label 
                              key={bank.id} 
                              className={`bank-option ${selectedBankId === bank.id ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`bank-${refund.id}`}
                                value={bank.id}
                                checked={selectedBankId === bank.id}
                                onChange={() => setSelectedBankId(bank.id)}
                              />
                              <div className="bank-option-content">
                                <strong>{bank.bankName}</strong>
                                <span>••••{bank.accountNumber.slice(-4)}</span>
                                {bank.isPrimary && <span className="primary-tag">Primary</span>}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="buyer-notes-input">
                    <label>Your Notes (Optional):</label>
                    <textarea
                      value={buyerNotes}
                      onChange={(e) => setBuyerNotes(e.target.value)}
                      placeholder="Add any notes for the supplier..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="refund-card-actions">
                  <button 
                    className="btn-reject"
                    onClick={() => handleRejectRefund(refund)}
                    disabled={processing}
                  >
                    ✕ Reject Method
                  </button>
                  <button 
                    className="btn-confirm"
                    onClick={() => handleConfirmRefund(refund)}
                    disabled={processing || (refund.refundMethod === 'BANK_TRANSFER' && !selectedBankId)}
                  >
                    {processing ? 'Processing...' : '✓ Confirm Refund'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherRefunds.length > 0 && (
        <div className="history-section">
          <h2 className="section-title">Refund History</h2>
          
          <div className="refund-list">
            {otherRefunds.map(refund => (
              <div key={refund.id} className="refund-item">
                <div className="refund-item-left">
                  <span className="order-number">{refund.orderNumber}</span>
                  <span className="refund-method-small">{getMethodLabel(refund.refundMethod)}</span>
                </div>
                <div className="refund-item-center">
                  <span className="refund-amount">${parseFloat(refund.refundAmount).toFixed(2)}</span>
                </div>
                <div className="refund-item-right">
                  <span className={`status-badge ${getStatusBadge(refund.status).class}`}>
                    {getStatusBadge(refund.status).label}
                  </span>
                  <span className="refund-date">
                    {new Date(refund.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {refunds.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h2>No Refund Requests</h2>
          <p>You don't have any refund requests at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default RefundRequests
