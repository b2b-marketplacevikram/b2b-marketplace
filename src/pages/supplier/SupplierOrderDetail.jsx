import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI, refundAPI, productAPI } from '../../services/api'
import '../../styles/SupplierOrderDetail.css'

function SupplierOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [productImages, setProductImages] = useState({}) // Map of productId -> imageUrl
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [paymentConfirming, setPaymentConfirming] = useState(false)
  
  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('ORIGINAL_PAYMENT')
  const [refundNotes, setRefundNotes] = useState('')
  const [refundProcessing, setRefundProcessing] = useState(false)
  
  // Payment confirmation modal state
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false)
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  // Fetch product images for items that don't have them
  useEffect(() => {
    const fetchProductImages = async () => {
      if (!order?.items) return
      
      console.log('Order items:', order.items)
      const itemsWithoutImages = order.items.filter(item => !item.productImage && !item.imageUrl)
      console.log('Items without images:', itemsWithoutImages)
      if (itemsWithoutImages.length === 0) return
      
      const imageMap = {}
      await Promise.all(
        itemsWithoutImages.map(async (item) => {
          try {
            console.log(`Fetching product ${item.productId}...`)
            const result = await productAPI.getById(item.productId)
            console.log(`Product ${item.productId} result:`, result)
            // Handle nested data structure from ApiResponse wrapper
            const productData = result.data?.data || result.data
            console.log(`Product ${item.productId} productData:`, productData)
            if (productData) {
              const imageUrl = productData.images?.[0]?.imageUrl || productData.imageUrl
              console.log(`Product ${item.productId} imageUrl:`, imageUrl)
              if (imageUrl) {
                imageMap[item.productId] = imageUrl
              }
            }
          } catch (error) {
            console.error(`Error fetching image for product ${item.productId}:`, error)
          }
        })
      )
      
      console.log('Final imageMap:', imageMap)
      if (Object.keys(imageMap).length > 0) {
        setProductImages(prev => ({ ...prev, ...imageMap }))
      }
    }
    
    fetchProductImages()
  }, [order?.items])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const result = await orderAPI.getByOrderNumber(orderId)
      
      if (result.success && result.data) {
        setOrder(result.data)
        setNewStatus(result.data.status)
        setTrackingNumber(result.data.trackingNumber || '')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) {
      return
    }

    try {
      setUpdating(true)
      const result = await orderAPI.updateStatus(order.orderNumber, newStatus)
      
      if (result.success) {
        setOrder({ ...order, status: newStatus })
        showToast('Order status updated successfully!', 'success')
      } else {
        showToast('Failed to update order status', 'error')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      showToast('Failed to update order status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleTrackingUpdate = async () => {
    if (!trackingNumber) {
      showToast('Please enter a tracking number', 'warning')
      return
    }

    try {
      setUpdating(true)
      // You may need to create an API endpoint for this
      showToast('Tracking number update feature coming soon!', 'info')
      // const result = await orderAPI.updateTracking(order.orderNumber, trackingNumber)
      // if (result.success) {
      //   setOrder({ ...order, trackingNumber })
      //   showToast('Tracking number updated successfully!', 'success')
      // }
    } catch (error) {
      console.error('Error updating tracking:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmPayment = async () => {
    try {
      setPaymentConfirming(true)
      const result = await orderAPI.confirmPayment(order.orderNumber)
      
      if (result.success) {
        setOrder({ ...order, paymentStatus: 'PAID' })
        setShowPaymentConfirmModal(false)
        showToast('Payment confirmed successfully! The order will now be processed.', 'success')
      } else {
        showToast('Failed to confirm payment: ' + (result.message || 'Unknown error'), 'error')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      showToast('Failed to confirm payment', 'error')
    } finally {
      setPaymentConfirming(false)
    }
  }

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      showToast('Please provide a reason for the refund', 'warning')
      return
    }

    try {
      setRefundProcessing(true)
      
      // Initiate refund request using the new refund flow
      const result = await refundAPI.initiateRefund({
        orderNumber: order.orderNumber,
        refundAmount: order.totalAmount,
        refundMethod: refundMethod,
        reason: refundReason,
        supplierNotes: refundNotes
      })
      
      if (result.success) {
        setOrder({ ...order, status: 'CANCELLED', paymentStatus: 'REFUND_PENDING' })
        setShowRefundModal(false)
        setRefundReason('')
        setRefundMethod('ORIGINAL_PAYMENT')
        setRefundNotes('')
        showToast('Refund request initiated! Waiting for buyer confirmation.', 'success')
      } else {
        showToast(result.message || 'Failed to initiate refund', 'error')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      showToast('Failed to initiate refund', 'error')
    } finally {
      setRefundProcessing(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PROCESSING': 'status-processing',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    }
    return statusMap[status] || 'status-pending'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="supplier-order-detail">
        <div className="loading">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="supplier-order-detail">
        <div className="error">Order not found</div>
        <Link to="/supplier/orders" className="btn-back">Back to Orders</Link>
      </div>
    )
  }

  return (
    <div className="order-detail-page">
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

      {/* Top Bar */}
      <div className="order-topbar">
        <button onClick={() => navigate('/supplier/orders')} className="back-btn">
          ← Back
        </button>
        <div className="order-id">
          <span className="order-number">{order.orderNumber}</span>
          <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
        </div>
        <div className="order-meta">
          <span>{formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="order-grid">
        {/* Left Column - Order Info */}
        <div className="order-main">
          {/* Payment Status Banner - Supplier View (Read-only) */}
          {order.paymentStatus === 'PAID' ? (
            <div className="payment-banner paid">
              <span className="banner-icon">✓</span>
              <div>
                <strong>Payment Received</strong>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          ) : order.paymentStatus === 'PENDING' && order.paymentMethod === 'Bank Transfer' && order.status !== 'CANCELLED' ? (
            <div className="payment-banner pending">
              <span className="banner-icon">⏳</span>
              <div>
                <strong>Awaiting Buyer Payment</strong>
                <span>Waiting for buyer to complete {order.paymentMethod} payment</span>
              </div>
            </div>
          ) : null}

          {/* Order Items */}
          <div className="card">
            <div className="card-header">
              <h3>Order Items</h3>
              <span className="badge">{order.items?.length || 0} items</span>
            </div>
            <div className="items-table">
              {order.items && order.items.map((item, index) => {
                const imageUrl = item.productImage || item.imageUrl || productImages[item.productId];
                console.log(`Item ${item.productId} imageUrl:`, imageUrl ? imageUrl.substring(0, 50) + '...' : 'none', 'productImages:', productImages);
                return (
                <div key={index} className="item-row">
                  <div className="item-img">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={item.productName}
                        onError={(e) => {
                          console.log(`Image load error for product ${item.productId}`);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => console.log(`Image loaded successfully for product ${item.productId}`)}
                      />
                    ) : null}
                    <div className="img-placeholder" style={{display: imageUrl ? 'none' : 'flex'}}>
                      {item.productName?.charAt(0) || 'P'}
                    </div>
                  </div>
                  <div className="item-info">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-sku">SKU: {item.productId || 'N/A'}</span>
                  </div>
                  <div className="item-qty">×{item.quantity}</div>
                  <div className="item-price">${parseFloat(item.unitPrice).toFixed(2)}</div>
                  <div className="item-subtotal">${parseFloat(item.totalPrice || item.quantity * item.unitPrice).toFixed(2)}</div>
                </div>
              )})}
            </div>
            <div className="order-summary-footer">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>{order.shippingCost ? `$${order.shippingCost}` : 'Free'}</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping - Side by Side */}
          <div className="info-cards">
            <div className="card small-card">
              <h4>Customer</h4>
              <p className="customer-id">Buyer #{order.buyerId}</p>
              <p className="info-detail">
                <span>Payment:</span> {order.paymentMethod || 'N/A'}
              </p>
              <p className="info-detail">
                <span>Status:</span> 
                <span className={`status-text ${order.paymentStatus === 'PAID' ? 'paid' : 'pending'}`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </p>
            </div>
            <div className="card small-card">
              <h4>Shipping</h4>
              <p className="address">{order.shippingAddress || 'No address provided'}</p>
              <p className="info-detail">
                <span>Method:</span> {order.shippingMethod || 'Standard'}
              </p>
              <p className="info-detail">
                <span>Tracking:</span> {order.trackingNumber || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="order-sidebar">
          {/* Quick Stats */}
          <div className="stats-card">
            <div className="stat">
              <span className="stat-value">${parseFloat(order.totalAmount).toFixed(2)}</span>
              <span className="stat-label">Order Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">{order.items?.length || 0}</span>
              <span className="stat-label">Items</span>
            </div>
          </div>

          {/* Update Status */}
          <div className="card action-card">
            <h4>Update Status</h4>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button 
              onClick={handleStatusUpdate} 
              disabled={updating || newStatus === order.status}
              className="action-btn primary"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Tracking */}
          <div className="card action-card">
            <h4>Tracking</h4>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
            <button onClick={handleTrackingUpdate} disabled={updating} className="action-btn">
              {updating ? 'Saving...' : 'Save Tracking'}
            </button>
          </div>

          {/* Refund Section - Only show for paid orders */}
          {order.paymentStatus === 'PAID' && order.status !== 'CANCELLED' && (
            <div className="card action-card refund-card">
              <h4>💰 Process Refund</h4>
              <p className="refund-note">Issue a refund for this order</p>
              <button 
                onClick={() => setShowRefundModal(true)} 
                className="action-btn refund-btn"
              >
                Initiate Refund
              </button>
            </div>
          )}

          {/* Refunded Badge */}
          {order.paymentStatus === 'REFUNDED' && (
            <div className="card refunded-badge-card">
              <div className="refunded-badge">
                <span className="refund-icon">↩</span>
                <div>
                  <strong>Refunded</strong>
                  <span>Payment returned to buyer</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card timeline-card">
            <h4>Order Timeline</h4>
            <div className="timeline">
              <div className={`step ${order.createdAt ? 'done' : ''}`}>
                <div className="dot"></div>
                <div className="step-info">
                  <span>Order Placed</span>
                  <small>{order.createdAt ? formatDate(order.createdAt) : '-'}</small>
                </div>
              </div>
              <div className={`step ${['CONFIRMED','PROCESSING','SHIPPED','DELIVERED'].includes(order.status) ? 'done' : ''}`}>
                <div className="dot"></div>
                <div className="step-info">
                  <span>Confirmed</span>
                  <small>{order.confirmedAt ? formatDate(order.confirmedAt) : '-'}</small>
                </div>
              </div>
              <div className={`step ${['SHIPPED','DELIVERED'].includes(order.status) ? 'done' : ''}`}>
                <div className="dot"></div>
                <div className="step-info">
                  <span>Shipped</span>
                  <small>{order.shippedAt ? formatDate(order.shippedAt) : '-'}</small>
                </div>
              </div>
              <div className={`step ${order.status === 'DELIVERED' ? 'done' : ''}`}>
                <div className="dot"></div>
                <div className="step-info">
                  <span>Delivered</span>
                  <small>{order.deliveredAt ? formatDate(order.deliveredAt) : '-'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="refund-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Process Refund</h3>
              <button className="modal-close" onClick={() => setShowRefundModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="refund-summary">
                <div className="refund-order-info">
                  <span>Order:</span>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div className="refund-amount">
                  <span>Refund Amount:</span>
                  <strong className="amount">${parseFloat(order.totalAmount).toFixed(2)}</strong>
                </div>
              </div>

              {/* Refund Method Selection */}
              <div className="refund-method-section">
                <label>Select Refund Method <span className="required">*</span></label>
                <div className="refund-method-options">
                  <label className={`method-option ${refundMethod === 'ORIGINAL_PAYMENT' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="refundMethod"
                      value="ORIGINAL_PAYMENT"
                      checked={refundMethod === 'ORIGINAL_PAYMENT'}
                      onChange={(e) => setRefundMethod(e.target.value)}
                    />
                    <div className="method-content">
                      <span className="method-icon">🔄</span>
                      <div className="method-info">
                        <strong>Original Payment Method</strong>
                        <p>Refund to the same payment method used for the order</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`method-option ${refundMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="refundMethod"
                      value="BANK_TRANSFER"
                      checked={refundMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setRefundMethod(e.target.value)}
                    />
                    <div className="method-content">
                      <span className="method-icon">🏦</span>
                      <div className="method-info">
                        <strong>Bank Transfer</strong>
                        <p>Transfer to buyer's bank account (buyer will provide details)</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`method-option ${refundMethod === 'WALLET_CREDIT' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="refundMethod"
                      value="WALLET_CREDIT"
                      checked={refundMethod === 'WALLET_CREDIT'}
                      onChange={(e) => setRefundMethod(e.target.value)}
                    />
                    <div className="method-content">
                      <span className="method-icon">💳</span>
                      <div className="method-info">
                        <strong>Wallet Credit</strong>
                        <p>Credit to buyer's platform wallet for future purchases</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="refund-form">
                <label htmlFor="refundReason">Reason for Refund <span className="required">*</span></label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter the reason for this refund (e.g., Customer request, Product defect, Order cancelled)"
                  rows={3}
                />
              </div>

              <div className="refund-form">
                <label htmlFor="refundNotes">Additional Notes (Optional)</label>
                <textarea
                  id="refundNotes"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Any additional notes for the buyer..."
                  rows={2}
                />
              </div>

              <div className="refund-info-box">
                <span className="info-icon">ℹ️</span>
                <p>The buyer will be notified and must confirm the refund method. 
                   {refundMethod === 'BANK_TRANSFER' && ' They will need to provide their bank details.'}
                   {refundMethod === 'WALLET_CREDIT' && ' The amount will be credited to their wallet after confirmation.'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowRefundModal(false)}
                disabled={refundProcessing}
              >
                Cancel
              </button>
              <button 
                className="btn-refund" 
                onClick={handleRefund}
                disabled={refundProcessing || !refundReason.trim()}
              >
                {refundProcessing ? 'Processing...' : 'Initiate Refund Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentConfirmModal(false)}>
          <div className="payment-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header confirm-header">
              <h3>💳 Confirm Payment</h3>
              <button className="modal-close" onClick={() => setShowPaymentConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-icon-container">
                <div className="confirm-icon">✓</div>
              </div>
              <h4>Confirm Payment Received?</h4>
              <p className="confirm-order-number">Order: <strong>{order?.orderNumber}</strong></p>
              <p className="confirm-amount">Amount: <strong>${parseFloat(order?.totalAmount || 0).toFixed(2)}</strong></p>
              
              <div className="confirm-warning">
                <span className="warning-icon">⚠️</span>
                <p>By confirming, you acknowledge that the payment for this order has been received. This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowPaymentConfirmModal(false)}
                disabled={paymentConfirming}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-payment" 
                onClick={handleConfirmPayment}
                disabled={paymentConfirming}
              >
                {paymentConfirming ? (
                  <>
                    <span className="btn-spinner"></span>
                    Confirming...
                  </>
                ) : (
                  <>✓ Yes, Confirm Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierOrderDetail
