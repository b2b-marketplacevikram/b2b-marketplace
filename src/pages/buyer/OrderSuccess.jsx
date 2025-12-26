import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './OrderSuccess.css'

const OrderSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartCleared, setCartCleared] = useState(false)

  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          // Optionally verify the session with backend
          const response = await fetch(`http://localhost:8084/api/payments/stripe/session/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setPaymentDetails(data)
            
            // Clear cart after successful payment verification
            if (!cartCleared) {
              clearCart()
              setCartCleared(true)
            }
          }
        } catch (error) {
          console.error('Failed to verify payment:', error)
        }
      }
      
      // Clear cart even if verification fails (payment was successful if we reached this page)
      if (!cartCleared) {
        clearCart()
        setCartCleared(true)
      }
      
      setLoading(false)
    }

    verifyPayment()
  }, [sessionId, clearCart, cartCleared])

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="success-container">
          <div className="loading-spinner"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {sessionId && (
          <div className="payment-info">
            <div className="info-row">
              <span className="label">Transaction ID:</span>
              <span className="value">{sessionId.substring(0, 20)}...</span>
            </div>
            {paymentDetails?.paymentStatus && (
              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-paid">{paymentDetails.paymentStatus}</span>
              </div>
            )}
          </div>
        )}

        <div className="success-details">
          <div className="detail-card">
            <div className="detail-icon">📧</div>
            <div className="detail-text">
              <h4>Confirmation Email</h4>
              <p>A confirmation email has been sent to your registered email address.</p>
            </div>
          </div>
          
          <div className="detail-card">
            <div className="detail-icon">📦</div>
            <div className="detail-text">
              <h4>Order Processing</h4>
              <p>Your order is now being processed and will be shipped soon.</p>
            </div>
          </div>
          
          <div className="detail-card">
            <div className="detail-icon">🚚</div>
            <div className="detail-text">
              <h4>Track Your Order</h4>
              <p>You can track your order status from your orders page.</p>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>

        <div className="support-note">
          <p>
            Have questions? Contact our support team at{' '}
            <a href="mailto:support@b2bmarketplace.com">support@b2bmarketplace.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
