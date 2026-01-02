import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { orderAPI, disputeAPI, productAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import BankTransferDetails from '../../components/BankTransferDetails'
import '../../styles/OrderTracking.css'

function OrderTracking() {
  const { orderId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeData, setDisputeData] = useState({
    disputeType: '',
    subject: '',
    description: '',
    refundRequested: false,
    refundAmount: ''
  })
  const [submittingDispute, setSubmittingDispute] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState({}) // Map of productId -> imageUrl
  const cartCleared = useRef(false)
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000)
  }
  
  // Check if redirected from successful payment (URL param, state, or sessionStorage)
  const paymentSuccessFromUrl = searchParams.get('payment') === 'success'
  const paymentSuccessFromState = location.state?.paymentConfirmed === true
  
  // Store in sessionStorage for page refreshes
  useEffect(() => {
    if (paymentSuccessFromUrl || paymentSuccessFromState) {
      sessionStorage.setItem(`payment_success_${orderId}`, 'true')
    }
  }, [orderId, paymentSuccessFromUrl, paymentSuccessFromState])
  
  const paymentSuccess = paymentSuccessFromUrl || paymentSuccessFromState || sessionStorage.getItem(`payment_success_${orderId}`) === 'true'
  const bankTransferPending = searchParams.get('bank_transfer') === 'pending'

  // Clear cart on successful payment - separate useEffect to ensure it runs
  useEffect(() => {
    if ((paymentSuccess || bankTransferPending) && !cartCleared.current) {
      cartCleared.current = true
      // Delay slightly to ensure user context is ready
      const timer = setTimeout(() => {
        clearCart()
        console.log('Cart cleared after payment success')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [paymentSuccess, bankTransferPending, clearCart])

  useEffect(() => {
    // Show bank details if bank transfer
    if (bankTransferPending) {
      setShowBankDetails(true)
    }
    
    // Show confirmation if redirected from checkout
    if (location.state?.orderConfirmed || paymentSuccess) {
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 5000)
    }

    // Fetch order from API
    const fetchOrder = async () => {
      try {
        const result = await orderAPI.getByOrderNumber(orderId)
        
        if (result.success && result.data) {
          const apiOrder = result.data
          
          // Payment is confirmed if status is PAID or if we came from successful payment redirect
          const isPaymentConfirmed = apiOrder.paymentStatus === 'PAID' || paymentSuccess
          
          console.log('Payment Status Check:', {
            apiPaymentStatus: apiOrder.paymentStatus,
            paymentSuccess,
            isPaymentConfirmed
          })
          
          // Map tracking steps based on order status
          const trackingSteps = [
            { 
              status: 'Order Placed', 
              date: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleString() : null,
              completed: true, 
              description: 'Your order has been received' 
            },
            { 
              status: 'Payment Confirmed', 
              date: isPaymentConfirmed ? (apiOrder.confirmedAt ? new Date(apiOrder.confirmedAt).toLocaleString() : new Date().toLocaleString()) : null,
              completed: isPaymentConfirmed, 
              description: 'Payment successfully processed' 
            },
            { 
              status: 'Processing', 
              date: apiOrder.status === 'PROCESSING' || apiOrder.status === 'CONFIRMED' ? new Date(apiOrder.updatedAt).toLocaleString() : null,
              completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(apiOrder.status), 
              description: 'Order is being prepared' 
            },
            { 
              status: 'Shipped', 
              date: apiOrder.shippedAt ? new Date(apiOrder.shippedAt).toLocaleString() : null,
              completed: ['SHIPPED', 'DELIVERED'].includes(apiOrder.status), 
              description: 'Order has been shipped' 
            },
            { 
              status: 'In Transit', 
              date: apiOrder.status === 'SHIPPED' ? new Date(apiOrder.shippedAt).toLocaleString() : null,
              completed: apiOrder.status === 'DELIVERED', 
              description: 'On the way to destination' 
            },
            { 
              status: 'Delivered', 
              date: apiOrder.deliveredAt ? new Date(apiOrder.deliveredAt).toLocaleString() : null,
              completed: apiOrder.status === 'DELIVERED', 
              description: 'Successfully delivered' 
            }
          ]
          
          // Transform API response to component format
          setOrder({
            id: apiOrder.id,
            orderNumber: apiOrder.orderNumber,
            date: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleDateString() : 'N/A',
            status: apiOrder.status.toLowerCase(),
            paymentConfirmed: isPaymentConfirmed,
            paymentStatus: isPaymentConfirmed ? 'PAID' : apiOrder.paymentStatus,
            estimatedDelivery: apiOrder.estimatedDeliveryDate || 'TBD',
            items: apiOrder.items.map(item => ({
              id: item.productId,
              name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              image: item.productImage || null,
              supplier: item.supplierName || 'Supplier'
            })),
            shippingAddress: apiOrder.shippingAddress || 'Address not available',
            paymentMethod: apiOrder.paymentMethod || 'N/A',
            subtotal: parseFloat(apiOrder.subtotal),
            shipping: parseFloat(apiOrder.shippingCost),
            tax: parseFloat(apiOrder.taxAmount),
            total: parseFloat(apiOrder.totalAmount),
            trackingSteps: trackingSteps,
            trackingNumber: apiOrder.trackingNumber || 'Not yet assigned',
            courier: apiOrder.shippingMethod || 'Standard Shipping'
          })
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, location.state])

  // Fetch product images for items that don't have them
  useEffect(() => {
    const fetchProductImages = async () => {
      if (!order?.items) return
      
      const itemsWithoutImages = order.items.filter(item => !item.image)
      if (itemsWithoutImages.length === 0) return
      
      const imageMap = {}
      await Promise.all(
        itemsWithoutImages.map(async (item) => {
          try {
            const result = await productAPI.getById(item.id)
            // Handle nested data structure from ApiResponse wrapper
            const productData = result.data?.data || result.data
            if (productData) {
              const imageUrl = productData.images?.[0]?.imageUrl || productData.imageUrl
              if (imageUrl) {
                imageMap[item.id] = imageUrl
              }
            }
          } catch (error) {
            console.error(`Error fetching image for product ${item.id}:`, error)
          }
        })
      )
      
      if (Object.keys(imageMap).length > 0) {
        setProductImages(prev => ({ ...prev, ...imageMap }))
      }
    }
    
    fetchProductImages()
  }, [order?.items])

  const handleContactSupport = () => {
    alert('Support contact form would open here')
  }

  const handleDownloadInvoice = () => {
    alert('Invoice download would start here')
  }

  const handleRaiseDispute = () => {
    setShowDisputeModal(true)
  }

  const handleDisputeSubmit = async (e) => {
    e.preventDefault()
    if (!disputeData.disputeType || !disputeData.subject || !disputeData.description) {
      alert('Please fill all required fields')
      return
    }

    setSubmittingDispute(true)
    try {
      const result = await disputeAPI.create({
        orderId: order.id,
        orderNumber: order.orderNumber,
        disputeType: disputeData.disputeType,
        subject: disputeData.subject,
        description: disputeData.description,
        refundRequested: disputeData.refundRequested,
        refundAmount: disputeData.refundRequested && disputeData.refundAmount ? 
          parseFloat(disputeData.refundAmount) : null
      })

      if (result.success && result.data?.data) {
        setShowDisputeModal(false)
        showToast(`Dispute ticket created successfully! Ticket #${result.data.data.ticketNumber}`, 'success')
        setTimeout(() => navigate(`/disputes/${result.data.data.ticketNumber}`), 2000)
      } else {
        showToast(result.message || 'Failed to create dispute', 'error')
      }
    } catch (err) {
      console.error('Error creating dispute:', err)
      showToast('Error creating dispute. Please try again.', 'error')
    } finally {
      setSubmittingDispute(false)
    }
  }

  const disputeTypes = [
    { value: 'PRODUCT_QUALITY', label: 'Product Quality Issue' },
    { value: 'WRONG_PRODUCT', label: 'Wrong Product Received' },
    { value: 'DAMAGED_PRODUCT', label: 'Damaged Product' },
    { value: 'MISSING_ITEMS', label: 'Missing Items' },
    { value: 'DELIVERY_ISSUE', label: 'Delivery Issue' },
    { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
    { value: 'PRICING_DISPUTE', label: 'Pricing Dispute' },
    { value: 'WARRANTY_CLAIM', label: 'Warranty Claim' },
    { value: 'OTHER', label: 'Other Issue' }
  ]

  if (loading) {
    return <div className="loading">Loading order details...</div>
  }

  if (!order) {
    return <div className="loading">Order not found</div>
  }

  // Check if order is bank transfer with pending payment
  const isBankTransferPending = order.paymentMethod === 'Bank Transfer' && order.paymentStatus !== 'PAID'

  return (
    <div className="order-tracking-page">
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

      {showConfirmation && (
        <div className="order-confirmation-banner">
          <div className="confirmation-content">
            <span className="success-icon">✓</span>
            <div>
              <h3>Order Placed Successfully!</h3>
              <p>Your order #{order.orderNumber} has been confirmed</p>
            </div>
          </div>
        </div>
      )}

      <div className="order-container">
        <div className="order-header">
          <div className="order-info">
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">Placed on {order.date}</p>
          </div>
          <div className="order-actions">
            <button className="btn-secondary" onClick={handleDownloadInvoice}>
              Download Invoice
            </button>
            <button className="btn-secondary" onClick={handleContactSupport}>
              Contact Support
            </button>
            {/* Only buyers can raise disputes against suppliers */}
            {user?.userType === 'BUYER' && (
              <button className="btn-dispute" onClick={handleRaiseDispute}>
                 Raise Dispute
              </button>
            )}
          </div>
        </div>

        {/* Bank Transfer Details - Show if pending */}
        {(showBankDetails || isBankTransferPending) && (
          <BankTransferDetails 
            orderNumber={order.orderNumber}
            amount={order.total}
          />
        )}

        {/* Order Status */}
        <div className="order-status-card">
          <div className="status-header">
            <h2>Order Status: <span className="status-badge">{order.status}</span></h2>
            <p>Estimated Delivery: {order.estimatedDelivery}</p>
          </div>

          <div className="tracking-timeline">
            {order.trackingSteps.map((step, index) => (
              <div key={index} className={`tracking-step ${step.completed ? 'completed' : ''}`}>
                <div className="step-marker">
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="step-content">
                  <h3>{step.status}</h3>
                  <p>{step.description}</p>
                  {step.date && <span className="step-date">{step.date}</span>}
                </div>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="tracking-info">
              <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
              <p><strong>Courier:</strong> {order.courier}</p>
              <button className="btn-link">Track on {order.courier} Website →</button>
            </div>
          )}
        </div>

        <div className="order-details-grid">
          {/* Order Items */}
          <div className="order-items-card">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items.map(item => {
                const imageUrl = item.image || productImages[item.id];
                return (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                      {item.name?.charAt(0) || 'P'}
                    </div>
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-supplier">Supplier: {item.supplier}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )})}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>₹{order.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹{order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="order-info-cards">
            <div className="info-card">
              <h3>Shipping Address</h3>
              {typeof order.shippingAddress === 'string' ? (
                <p>{order.shippingAddress || 'Address not available'}</p>
              ) : (
                <>
                  <p>{order.shippingAddress?.company}</p>
                  <p>{order.shippingAddress?.contact}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </>
              )}
            </div>

            <div className="info-card">
              <h3>Payment Method</h3>
              <p>{order.paymentMethod || order.paymentType || 'N/A'}</p>
              {order.paymentConfirmed || order.paymentStatus === 'PAID' ? (
                <p className="payment-status confirmed">✓ Payment Confirmed</p>
              ) : order.paymentStatus === 'PENDING' ? (
                <p className="payment-status pending">⏳ Payment Pending</p>
              ) : order.paymentStatus === 'SUBMITTED' ? (
                <p className="payment-status submitted">📤 Payment Submitted - Awaiting Verification</p>
              ) : order.paymentStatus === 'FAILED' ? (
                <p className="payment-status failed">✕ Payment Failed</p>
              ) : (
                <p className="payment-status confirmed">✓ Payment Confirmed</p>
              )}
            </div>

            <div className="info-card help-card">
              <h3>Need Help?</h3>
              <p>Contact our support team for any questions about your order.</p>
              <button className="btn-primary" onClick={handleContactSupport}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="dispute-modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="dispute-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Raise a Dispute</h2>
              <button className="close-btn" onClick={() => setShowDisputeModal(false)}>×</button>
            </div>
            
            <div className="modal-compliance-notice">
              <strong>Consumer Protection Act 2019:</strong> Your dispute will be acknowledged within 48 hours 
              and resolved within 30 days as per Indian E-Commerce Rules 2020.
            </div>

            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label>Dispute Type *</label>
                <select 
                  value={disputeData.disputeType}
                  onChange={(e) => setDisputeData({...disputeData, disputeType: e.target.value})}
                  required
                >
                  <option value="">Select issue type</option>
                  {disputeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={disputeData.subject}
                  onChange={(e) => setDisputeData({...disputeData, subject: e.target.value})}
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({...disputeData, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={disputeData.refundRequested}
                    onChange={(e) => setDisputeData({...disputeData, refundRequested: e.target.checked})}
                  />
                  Request a refund
                </label>
              </div>

              {disputeData.refundRequested && (
                <div className="form-group">
                  <label>Refund Amount (₹)</label>
                  <input
                    type="number"
                    value={disputeData.refundAmount}
                    onChange={(e) => setDisputeData({...disputeData, refundAmount: e.target.value})}
                    placeholder={`Max: ₹${order.total?.toLocaleString('en-IN')}`}
                    max={order.total}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submittingDispute}>
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTracking
