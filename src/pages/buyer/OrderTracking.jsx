import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useSearchParams } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import BankTransferDetails from '../../components/BankTransferDetails'
import '../../styles/OrderTracking.css'

function OrderTracking() {
  const { orderId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const cartCleared = useRef(false)
  
  // Check if redirected from successful payment
  const paymentSuccess = searchParams.get('payment') === 'success'
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
            estimatedDelivery: apiOrder.estimatedDeliveryDate || 'TBD',
            items: apiOrder.items.map(item => ({
              id: item.productId,
              name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              image: '/images/product-placeholder.jpg',
              supplier: 'Supplier'
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

  const handleContactSupport = () => {
    alert('Support contact form would open here')
  }

  const handleDownloadInvoice = () => {
    alert('Invoice download would start here')
  }

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
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-supplier">Supplier: {item.supplier}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
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
              <p>{order.paymentMethod}</p>
              <p className="payment-status">✓ Payment Confirmed</p>
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
    </div>
  )
}

export default OrderTracking
