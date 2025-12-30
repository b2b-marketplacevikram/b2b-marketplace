import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import '../../styles/OrderHistory.css'

function OrderHistory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      console.log('Fetching orders for user:', user.id)
      const result = await orderAPI.getByBuyer(user.id)
      console.log('Orders result:', result)
      
      if (result.success && Array.isArray(result.data)) {
        // Sort by date (newest first)
        const sortedOrders = result.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setOrders(sortedOrders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError('Failed to load order history')
    } finally {
      setLoading(false)
    }
  }

  // Handle order card click - navigate to payment or order details
  const handleOrderClick = (order) => {
    // If payment is pending, go to payment instructions
    if (order.paymentStatus === 'AWAITING_PAYMENT' || order.status === 'AWAITING_PAYMENT') {
      // Determine payment type from payment method
      const paymentMethod = order.paymentMethod?.toLowerCase() || ''
      let paymentType = 'BANK_TRANSFER'
      if (paymentMethod.includes('upi')) {
        paymentType = 'UPI'
      } else if (paymentMethod.includes('razorpay')) {
        paymentType = 'URGENT_ONLINE'
      } else if (paymentMethod.includes('stripe')) {
        paymentType = 'STRIPE'
      }
      
      navigate(`/orders/${order.orderNumber}/payment-instructions`, {
        state: {
          orderDetails: order,
          paymentType: paymentType,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      })
    } else {
      // Otherwise go to order tracking/details
      navigate(`/orders/${order.orderNumber}`)
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

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'payment-pending',
      'PAID': 'payment-paid',
      'FAILED': 'payment-failed',
      'REFUNDED': 'payment-refunded'
    }
    return statusMap[status] || 'payment-pending'
  }

  const handleCancelOrder = (orderId) => {
    setCancellingOrderId(orderId)
    setShowCancelDialog(true)
    setCancelReason('')
  }

  const confirmCancelOrder = async () => {
    if (!cancellingOrderId) return

    try {
      setLoading(true)
      const result = await orderAPI.cancel(cancellingOrderId, cancelReason)
      
      if (result.success) {
        // Reload orders
        await loadOrders()
        setShowCancelDialog(false)
        setCancellingOrderId(null)
        setCancelReason('')
      } else {
        setError(result.message || 'Failed to cancel order')
      }
    } catch (err) {
      console.error('Failed to cancel order:', err)
      setError('Failed to cancel order')
    } finally {
      setLoading(false)
    }
  }

  const canCancelOrder = (order) => {
    return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && 
           order.status !== 'CANCELLED' &&
           order.status !== 'REFUNDED'
  }

  const filteredOrders = orders.filter(order => {
    let matchesStatus = filterStatus === 'all' || order.status === filterStatus
    // Special handling for AWAITING_PAYMENT - check both status and paymentStatus
    if (filterStatus === 'AWAITING_PAYMENT') {
      matchesStatus = order.status === 'AWAITING_PAYMENT' || order.paymentStatus === 'AWAITING_PAYMENT'
    }
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading">Loading order history...</div>
      </div>
    )
  }

  // Debug: Log orders
  console.log('Orders state:', orders)
  console.log('Filtered orders:', filteredOrders)
  console.log('User:', user)

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>My Orders</h1>
        <p>View and track all your orders</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="order-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </button>
          <button
            className={filterStatus === 'AWAITING_PAYMENT' ? 'active' : ''}
            onClick={() => setFilterStatus('AWAITING_PAYMENT')}
            style={filterStatus === 'AWAITING_PAYMENT' ? { background: '#ff9800', borderColor: '#ff9800' } : {}}
          >
            💳 Awaiting Payment
          </button>
          <button
            className={filterStatus === 'PENDING' ? 'active' : ''}
            onClick={() => setFilterStatus('PENDING')}
          >
            Pending
          </button>
          <button
            className={filterStatus === 'CONFIRMED' ? 'active' : ''}
            onClick={() => setFilterStatus('CONFIRMED')}
          >
            Confirmed
          </button>
          <button
            className={filterStatus === 'PROCESSING' ? 'active' : ''}
            onClick={() => setFilterStatus('PROCESSING')}
          >
            Processing
          </button>
          <button
            className={filterStatus === 'SHIPPED' ? 'active' : ''}
            onClick={() => setFilterStatus('SHIPPED')}
          >
            Shipped
          </button>
          <button
            className={filterStatus === 'DELIVERED' ? 'active' : ''}
            onClick={() => setFilterStatus('DELIVERED')}
          >
            Delivered
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No orders found</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'You haven\'t placed any orders yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link to="/" className="btn-primary">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="order-card" 
              style={{ minHeight: '150px', padding: '20px', cursor: 'pointer' }}
              onClick={() => handleOrderClick(order)}
            >
              {/* Payment Required Banner */}
              {(order.paymentStatus === 'AWAITING_PAYMENT' || order.status === 'AWAITING_PAYMENT') && (
                <div style={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  padding: '10px 15px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>💳 <strong>Payment Required</strong> - Click to complete your payment</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px' }}>
                    Complete Payment →
                  </span>
                </div>
              )}
              <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f9f9f9' }}>
                <div className="order-info">
                  <h3 style={{ color: '#2c3e50', fontSize: '1.2rem', margin: 0 }}>Order #{order.orderNumber || order.id}</h3>
                  <p className="order-date" style={{ color: '#7f8c8d', fontSize: '0.9rem', margin: '5px 0 0' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="order-status-badges" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`} style={{ padding: '5px 10px', borderRadius: '15px', background: order.paymentStatus === 'AWAITING_PAYMENT' ? '#fff3e0' : '#e3f2fd', color: order.paymentStatus === 'AWAITING_PAYMENT' ? '#e65100' : '#1976d2' }}>
                    {order.status}
                  </span>
                  <span className={`payment-badge ${getPaymentStatusBadge(order.paymentStatus)}`} style={{ padding: '5px 10px', borderRadius: '15px', background: '#fff3e0', color: '#e65100' }}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="order-card-body" style={{ padding: '15px' }}>
                <div className="order-items">
                  <h4 style={{ color: '#333', margin: '0 0 10px' }}>Items ({order.items?.length || 0})</h4>
                  <div className="items-preview">
                    {order.items && order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="item-preview">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="item-more">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>₹{order.tax?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>₹{order.shippingCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="order-card-footer">
                <div className="shipping-info">
                  <span className="label">Ship to:</span>
                  <span className="address">{order.shippingAddress || 'N/A'}</span>
                </div>
                <div className="order-actions">
                  <Link 
                    to={`/order-tracking/${order.orderNumber || order.id}`}
                    className="btn-track"
                  >
                    Track Order
                  </Link>
                  {canCancelOrder(order) && (
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <button className="btn-reorder">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="modal-overlay" onClick={() => setShowCancelDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            
            <div className="form-group">
              <label>Reason for cancellation (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Order
              </button>
              <button 
                className="btn-danger"
                onClick={confirmCancelOrder}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistory
