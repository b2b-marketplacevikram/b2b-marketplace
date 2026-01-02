import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supplierAPI, orderAPI } from '../../services/api'
import './PaymentVerification.css'

function PaymentVerification() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [supplierId, setSupplierId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Fetch supplier ID from user ID
  useEffect(() => {
    const fetchSupplierId = async () => {
      if (user?.id) {
        try {
          const result = await supplierAPI.getByUserId(user.id)
          if (result.success && result.data) {
            setSupplierId(result.data.id)
          }
        } catch (error) {
          console.error('Error fetching supplier ID:', error)
        }
      }
    }
    fetchSupplierId()
  }, [user])

  // Fetch orders awaiting payment verification
  useEffect(() => {
    if (supplierId) {
      fetchAwaitingOrders()
    }
  }, [supplierId])

  const fetchAwaitingOrders = async () => {
    try {
      setLoading(true)
      const result = await orderAPI.getAwaitingVerification(supplierId)
      if (result.success) {
        setOrders(result.data || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to load orders' })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setMessage({ type: 'error', text: 'Failed to load orders' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (order, approved) => {
    if (!approved && !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' })
      return
    }

    try {
      setVerifying(true)
      const result = await orderAPI.verifyPayment(order.orderNumber, {
        approved: approved,
        rejectionReason: approved ? null : rejectionReason.trim()
      })

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: approved 
            ? `Payment verified for order ${order.orderNumber}. Order will now be processed.`
            : `Payment rejected for order ${order.orderNumber}. Buyer has been notified.`
        })

        // Remove from list
        setOrders(prev => prev.filter(o => o.orderNumber !== order.orderNumber))
        setSelectedOrder(null)
        setShowRejectModal(false)
        setRejectionReason('')
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to verify payment. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to verify payment. Please try again.' 
      })
    } finally {
      setVerifying(false)
    }
  }

  const getPaymentTypeLabel = (type) => {
    const labels = {
      'BANK_TRANSFER': 'Bank Transfer',
      'UPI': 'UPI Payment',
      'CREDIT_TERMS': 'Credit Terms',
      'URGENT_ONLINE': 'Online Payment'
    }
    return labels[type] || type
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="payment-verification-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders awaiting verification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-verification-page">
      <div className="verification-container">
        <div className="page-header">
          <h1>💳 Payment Verification</h1>
          <p>Review and verify payment proofs submitted by buyers</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h2>All Caught Up!</h2>
            <p>No orders are waiting for payment verification.</p>
          </div>
        ) : (
          <div className="orders-grid">
            <div className="orders-list">
              <h3>Orders Awaiting Verification ({orders.length})</h3>
              {orders.map(order => (
                <div 
                  key={order.orderNumber}
                  className={`order-card ${selectedOrder?.orderNumber === order.orderNumber ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className={`payment-badge ${order.paymentType?.toLowerCase()}`}>
                      {getPaymentTypeLabel(order.paymentType)}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-amount">₹{parseFloat(order.totalAmount).toFixed(2)}</div>
                    {order.poNumber && (
                      <div className="po-number">PO: {order.poNumber}</div>
                    )}
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="order-card-footer">
                    <span className="view-details">Click to review →</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-detail-panel">
              {selectedOrder ? (
                <>
                  <div className="detail-header">
                    <h3>Order Details</h3>
                    <span className="order-id">#{selectedOrder.orderNumber}</span>
                  </div>

                  <div className="detail-section">
                    <h4>Order Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Order Date:</span>
                        <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Amount:</span>
                        <span className="value amount">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Payment Method:</span>
                        <span className="value">{getPaymentTypeLabel(selectedOrder.paymentType)}</span>
                      </div>
                      {selectedOrder.poNumber && (
                        <div className="info-item">
                          <span className="label">PO Number:</span>
                          <span className="value">{selectedOrder.poNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Payment Proof</h4>
                    {selectedOrder.paymentReference && (
                      <div className="info-item">
                        <span className="label">Reference/UTR:</span>
                        <span className="value reference">{selectedOrder.paymentReference}</span>
                      </div>
                    )}
                    {selectedOrder.paymentProofUrl ? (
                      <div className="proof-preview">
                        <a 
                          href={selectedOrder.paymentProofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-proof-btn"
                        >
                          📄 View Payment Proof
                        </a>
                        <img 
                          src={selectedOrder.paymentProofUrl} 
                          alt="Payment Proof"
                          className="proof-image"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    ) : (
                      <div className="no-proof">
                        No payment proof uploaded yet
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Order Items</h4>
                    <div className="items-list">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="item-row">
                          <span className="item-name">{item.productName}</span>
                          <span className="item-qty">×{item.quantity}</span>
                          <span className="item-price">₹{parseFloat(item.unitPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="verification-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleVerifyPayment(selectedOrder, true)}
                      disabled={verifying}
                    >
                      {verifying ? 'Verifying...' : '✓ Approve Payment'}
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => setShowRejectModal(true)}
                      disabled={verifying}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <div className="no-selection-icon">👈</div>
                  <p>Select an order from the list to view details and verify payment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reject Payment</h3>
                <button className="close-btn" onClick={() => setShowRejectModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p>
                  Please provide a reason for rejecting the payment for order 
                  <strong> #{selectedOrder?.orderNumber}</strong>. 
                  This will be sent to the buyer.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Payment reference does not match, Amount is incorrect, Proof is not clear..."
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleVerifyPayment(selectedOrder, false)}
                  disabled={verifying || !rejectionReason.trim()}
                >
                  {verifying ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentVerification
