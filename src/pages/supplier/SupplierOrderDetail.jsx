import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import '../../styles/SupplierOrderDetail.css'

function SupplierOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [paymentConfirming, setPaymentConfirming] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

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
        alert('Order status updated successfully!')
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const handleTrackingUpdate = async () => {
    if (!trackingNumber) {
      alert('Please enter a tracking number')
      return
    }

    try {
      setUpdating(true)
      // You may need to create an API endpoint for this
      alert('Tracking number update feature coming soon!')
      // const result = await orderAPI.updateTracking(order.orderNumber, trackingNumber)
      // if (result.success) {
      //   setOrder({ ...order, trackingNumber })
      //   alert('Tracking number updated successfully!')
      // }
    } catch (error) {
      console.error('Error updating tracking:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!window.confirm('Are you sure you want to confirm payment received for this order? This action cannot be undone.')) {
      return
    }

    try {
      setPaymentConfirming(true)
      const result = await orderAPI.confirmPayment(order.orderNumber)
      
      if (result.success) {
        setOrder({ ...order, paymentStatus: 'PAID' })
        alert('Payment confirmed successfully! The order will now be processed.')
      } else {
        alert('Failed to confirm payment: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Failed to confirm payment')
    } finally {
      setPaymentConfirming(false)
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
    <div className="supplier-order-detail">
      <div className="order-header">
        <div className="header-top">
          <button onClick={() => navigate('/supplier/orders')} className="btn-back">
            ← Back to Orders
          </button>
          <h1>Order Details</h1>
        </div>
        
        <div className="order-summary">
          <div className="summary-item">
            <span className="label">Order Number</span>
            <span className="value">{order.orderNumber}</span>
          </div>
          <div className="summary-item">
            <span className="label">Status</span>
            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Order Date</span>
            <span className="value">{formatDate(order.createdAt)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Amount</span>
            <span className="value amount">${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="order-content">
        <div className="content-left">
          {/* Order Items */}
          <div className="section">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src="/images/product-placeholder.jpg" alt={item.productName} />
                  </div>
                  <div className="item-details">
                    <h3>{item.productName}</h3>
                    <div className="item-info">
                      <span>Quantity: {item.quantity}</span>
                      <span>Unit Price: ${parseFloat(item.unitPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="item-total">
                    ${parseFloat(item.totalPrice).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="section">
            <h2>Customer Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Buyer ID</span>
                <span className="value">{order.buyerId}</span>
              </div>
              <div className="info-item">
                <span className="label">Payment Method</span>
                <span className="value">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Payment Status</span>
                <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'status-confirmed' : 'status-pending'}`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="section">
            <h2>Shipping Information</h2>
            <div className="info-grid">
              <div className="info-item full-width">
                <span className="label">Shipping Address</span>
                <span className="value">{order.shippingAddress || 'N/A'}</span>
              </div>
              <div className="info-item full-width">
                <span className="label">Billing Address</span>
                <span className="value">{order.billingAddress || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Shipping Method</span>
                <span className="value">{order.shippingMethod || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Tracking Number</span>
                <span className="value">{order.trackingNumber || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="section">
              <h2>Order Notes</h2>
              <p className="notes">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="content-right">
          {/* Confirm Bank Transfer Payment */}
          {order.paymentMethod === 'Bank Transfer' && order.paymentStatus !== 'PAID' && (
            <div className="section action-section payment-confirmation">
              <div className="payment-alert">
                <span className="alert-icon">⏳</span>
                <div className="alert-content">
                  <h3>Awaiting Bank Transfer</h3>
                  <p>This order is waiting for bank transfer confirmation</p>
                </div>
              </div>
              <div className="payment-details">
                <p><strong>Order Amount:</strong> ${parseFloat(order.totalAmount).toFixed(2)}</p>
                <p><strong>Payment Method:</strong> Bank Transfer</p>
              </div>
              <button 
                onClick={handleConfirmPayment} 
                disabled={paymentConfirming}
                className="btn-confirm-payment"
              >
                {paymentConfirming ? 'Confirming...' : '✓ Confirm Payment Received'}
              </button>
              <p className="payment-note">
                Only confirm after verifying the payment in your bank account.
              </p>
            </div>
          )}

          {/* Payment Confirmed Badge */}
          {order.paymentStatus === 'PAID' && (
            <div className="section payment-confirmed-section">
              <div className="payment-confirmed-badge">
                <span className="check-icon">✓</span>
                <div>
                  <h3>Payment Confirmed</h3>
                  <p>{order.paymentMethod} - Received</p>
                </div>
              </div>
            </div>
          )}

          {/* Update Order Status */}
          <div className="section action-section">
            <h2>Update Order Status</h2>
            <div className="form-group">
              <label>Current Status: <strong>{order.status}</strong></label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="status-select"
              >
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
                className="btn-update"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Add Tracking Number */}
          <div className="section action-section">
            <h2>Tracking Information</h2>
            <div className="form-group">
              <label>Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="tracking-input"
              />
              <button 
                onClick={handleTrackingUpdate} 
                disabled={updating}
                className="btn-update"
              >
                {updating ? 'Updating...' : 'Update Tracking'}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="section">
            <h2>Order Summary</h2>
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${parseFloat(order.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${parseFloat(order.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="section">
            <h2>Order Timeline</h2>
            <div className="timeline">
              <div className={`timeline-item ${order.createdAt ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-date">{formatDate(order.createdAt)}</div>
                </div>
              </div>
              <div className={`timeline-item ${order.confirmedAt ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Order Confirmed</div>
                  <div className="timeline-date">{formatDate(order.confirmedAt)}</div>
                </div>
              </div>
              <div className={`timeline-item ${order.shippedAt ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Order Shipped</div>
                  <div className="timeline-date">{formatDate(order.shippedAt)}</div>
                </div>
              </div>
              <div className={`timeline-item ${order.deliveredAt ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Order Delivered</div>
                  <div className="timeline-date">{formatDate(order.deliveredAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierOrderDetail
