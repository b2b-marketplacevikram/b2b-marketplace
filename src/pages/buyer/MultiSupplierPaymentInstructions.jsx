import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import './PaymentInstructions.css'

function MultiSupplierPaymentInstructions() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [orders, setOrders] = useState(location.state?.orders || [])
  const [paymentType, setPaymentType] = useState(location.state?.paymentType || 'BANK_TRANSFER')
  const [totalAmount, setTotalAmount] = useState(location.state?.totalAmount || 0)
  const [paymentStatus, setPaymentStatus] = useState({}) // Track payment status per order
  const [message, setMessage] = useState({ type: '', text: '' })
  const [copiedField, setCopiedField] = useState(null)
  const [expandedQR, setExpandedQR] = useState({}) // Track which QR codes are expanded

  // Detect if user is on mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  useEffect(() => {
    if (!orders || orders.length === 0) {
      navigate('/orders')
    }
  }, [orders, navigate])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setMessage({ type: 'success', text: `${label} copied to clipboard!` })
    setTimeout(() => {
      setMessage({ type: '', text: '' })
      setCopiedField(null)
    }, 2000)
  }

  // Generate UPI Deep Link for a specific order
  const generateUPILink = (order) => {
    if (!order.bankDetails?.upiId || !order.totalAmount) return null
    
    const upiId = order.bankDetails.upiId
    const payeeName = encodeURIComponent(order.bankDetails.accountHolderName || order.supplierName || 'Supplier')
    const amount = order.totalAmount.toFixed(2)
    const transactionNote = encodeURIComponent(`Order ${order.orderNumber}`)
    const merchantCode = encodeURIComponent('MarketPlus')
    
    return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&tn=${transactionNote}&mc=${merchantCode}&cu=INR`
  }

  // Handle UPI App payment
  const handlePayWithUPI = (order) => {
    const upiLink = generateUPILink(order)
    if (!upiLink) {
      setMessage({ type: 'error', text: 'UPI payment details not available' })
      return
    }
    
    window.location.href = upiLink
    
    setTimeout(() => {
      setMessage({ 
        type: 'info', 
        text: 'Complete the payment in your UPI app, then mark as paid.' 
      })
    }, 1000)
  }

  // Copy all bank details for an order
  const copyAllBankDetails = (order) => {
    const details = `
Bank Name: ${order.bankDetails?.bankName || 'N/A'}
Account Name: ${order.bankDetails?.accountHolderName || 'N/A'}
Account Number: ${order.bankDetails?.accountNumber || 'N/A'}
IFSC Code: ${order.bankDetails?.ifscCode || 'N/A'}

Amount: ₹${order.totalAmount?.toFixed(2) || '0.00'}
Reference: Order #${order.orderNumber}
    `.trim()
    
    navigator.clipboard.writeText(details)
    setMessage({ type: 'success', text: 'All bank details copied to clipboard!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // Toggle QR code visibility
  const toggleQR = (orderNumber) => {
    setExpandedQR(prev => ({ ...prev, [orderNumber]: !prev[orderNumber] }))
  }

  const markAsPaid = (orderNumber) => {
    setPaymentStatus(prev => ({ ...prev, [orderNumber]: 'paid' }))
  }

  const allPaid = orders.length > 0 && orders.every(order => paymentStatus[order.orderNumber] === 'paid')

  if (!orders || orders.length === 0) {
    return <div className="payment-instructions-page"><p>Loading...</p></div>
  }

  return (
    <div className="payment-instructions-page">
      <div className="payment-instructions-container multi-supplier">
        <div className="success-header">
          <div className="success-icon">📋</div>
          <h1>Orders Created Successfully!</h1>
          <p className="success-subtitle">
            Your cart contained items from <strong>{orders.length} different suppliers</strong>. 
            Separate orders have been created for each supplier.
          </p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="multi-supplier-summary">
          <div className="summary-card total-summary">
            <h3>💰 Total Amount to Pay</h3>
            <div className="total-amount">{formatCurrency(totalAmount)}</div>
            <p className="summary-note">Split across {orders.length} suppliers as shown below</p>
          </div>
        </div>

        <div className="multi-supplier-orders">
          <h2>Payment Instructions by Supplier</h2>
          <p className="instruction-note">
            Please make <strong>separate payments</strong> to each supplier. 
            Mark each as paid after completing the transfer.
          </p>

          {orders.map((order, index) => (
            <div 
              key={order.orderNumber} 
              className={`supplier-order-card ${paymentStatus[order.orderNumber] === 'paid' ? 'paid' : ''}`}
            >
              <div className="supplier-order-header">
                <div className="supplier-info">
                  <span className="supplier-number">Supplier {index + 1}</span>
                  <h3>{order.supplierName || `Supplier ${order.supplierId}`}</h3>
                </div>
                <div className="order-amount">
                  <span className="amount-label">Amount Due:</span>
                  <span className="amount-value">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="supplier-order-details">
                <div className="order-info-row">
                  <span className="label">Order Number:</span>
                  <span className="value order-number">{order.orderNumber}</span>
                  <button 
                    className="copy-btn small"
                    onClick={() => copyToClipboard(order.orderNumber, 'Order number')}
                  >
                    📋
                  </button>
                </div>

                <div className="order-items-summary">
                  <span className="label">Items:</span>
                  <span className="value">
                    {order.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>

              {order.bankDetails && (
                <div className="bank-details-section">
                  {/* Check if bank details are not configured */}
                  {order.bankDetails.notConfigured ? (
                    <div className="bank-not-configured">
                      <div className="warning-icon">⚠️</div>
                      <h4>Bank Details Not Configured</h4>
                      <p>
                        This supplier hasn't set up their bank details yet. 
                        Please contact the supplier or wait for them to configure payment information.
                      </p>
                      <p className="supplier-contact">
                        <strong>Supplier:</strong> {order.supplierName || `Supplier #${order.supplierId}`}
                      </p>
                    </div>
                  ) : paymentType === 'BANK_TRANSFER' ? (
                    <>
                      <div className="section-header">
                        <h4>🏦 Bank Transfer Details</h4>
                        <button 
                          className="copy-all-btn-small"
                          onClick={() => copyAllBankDetails(order)}
                        >
                          📋 Copy All
                        </button>
                      </div>
                      <div className="bank-details-grid">
                        <div className="bank-detail-item">
                          <span className="label">Bank Name:</span>
                          <span className="value">{order.bankDetails.bankName}</span>
                        </div>
                        <div className="bank-detail-item">
                          <span className="label">Account Holder:</span>
                          <span className="value">{order.bankDetails.accountHolderName}</span>
                        </div>
                        <div className="bank-detail-item highlight">
                          <span className="label">Account Number:</span>
                          <span className="value account-number">{order.bankDetails.accountNumber}</span>
                          <button 
                            className={`copy-btn ${copiedField === `acc-${order.orderNumber}` ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(order.bankDetails.accountNumber, `acc-${order.orderNumber}`)}
                          >
                            {copiedField === `acc-${order.orderNumber}` ? '✓' : 'Copy'}
                          </button>
                        </div>
                        <div className="bank-detail-item highlight">
                          <span className="label">IFSC Code:</span>
                          <span className="value ifsc-code">{order.bankDetails.ifscCode}</span>
                          <button 
                            className={`copy-btn ${copiedField === `ifsc-${order.orderNumber}` ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(order.bankDetails.ifscCode, `ifsc-${order.orderNumber}`)}
                          >
                            {copiedField === `ifsc-${order.orderNumber}` ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="transfer-amount-box">
                        <span className="label">Transfer Amount:</span>
                        <span className="amount">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4>📱 UPI Payment</h4>
                      
                      {/* Pay Now Button */}
                      <div className="upi-pay-section">
                        {isMobile ? (
                          <button 
                            className="pay-now-btn-compact"
                            onClick={() => handlePayWithUPI(order)}
                          >
                            📲 Pay {formatCurrency(order.totalAmount)} with UPI App
                          </button>
                        ) : (
                          <button 
                            className="show-qr-btn"
                            onClick={() => toggleQR(order.orderNumber)}
                          >
                            {expandedQR[order.orderNumber] ? '🔼 Hide QR Code' : '📱 Show QR Code to Pay'}
                          </button>
                        )}
                      </div>

                      {/* QR Code */}
                      {(expandedQR[order.orderNumber] || !isMobile) && (
                        <div className="qr-code-compact">
                          {generateUPILink(order) ? (
                            <QRCodeSVG 
                              value={generateUPILink(order)}
                              size={140}
                              level="H"
                              includeMargin={true}
                              bgColor="#ffffff"
                              fgColor="#1a1a2e"
                            />
                          ) : (
                            <div className="qr-placeholder-small">QR N/A</div>
                          )}
                          <p className="qr-hint">Scan with any UPI app</p>
                        </div>
                      )}

                      {/* UPI ID */}
                      <div className="upi-id-container">
                        <span className="label">Or pay to UPI ID:</span>
                        <div className="upi-id-row">
                          <span className="upi-id">{order.bankDetails.upiId}</span>
                          <button 
                            className={`copy-btn ${copiedField === `upi-${order.orderNumber}` ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(order.bankDetails.upiId, `upi-${order.orderNumber}`)}
                          >
                            {copiedField === `upi-${order.orderNumber}` ? '✓ Copied' : '📋 Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="transfer-amount-box">
                        <span className="label">Pay Amount:</span>
                        <span className="amount">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="payment-reference-note">
                <p>⚠️ <strong>Important:</strong> Include order number <code>{order.orderNumber}</code> as payment reference/remarks</p>
              </div>

              <div className="supplier-order-actions">
                {paymentStatus[order.orderNumber] === 'paid' ? (
                  <div className="paid-badge">
                    ✅ Marked as Paid
                  </div>
                ) : (
                  <button 
                    className="mark-paid-btn"
                    onClick={() => markAsPaid(order.orderNumber)}
                  >
                    Mark as Paid
                  </button>
                )}
                <button 
                  className="upload-proof-btn"
                  onClick={() => navigate(`/orders/${order.orderNumber}/payment-instructions`, {
                    state: { 
                      orderDetails: order,
                      bankDetails: order.bankDetails,
                      paymentType: paymentType
                    }
                  })}
                >
                  Upload Payment Proof
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="completion-section">
          {allPaid ? (
            <div className="all-paid-message">
              <div className="success-icon">🎉</div>
              <h3>All Payments Completed!</h3>
              <p>You have marked all supplier payments as completed. The suppliers will verify your payments and process your orders.</p>
              <button className="view-orders-btn" onClick={() => navigate('/orders')}>
                View All Orders
              </button>
            </div>
          ) : (
            <div className="pending-payments-message">
              <p>
                <strong>{Object.keys(paymentStatus).filter(k => paymentStatus[k] === 'paid').length}</strong> of <strong>{orders.length}</strong> payments marked as complete
              </p>
              <button className="view-orders-btn secondary" onClick={() => navigate('/orders')}>
                Complete Later - View Orders
              </button>
            </div>
          )}
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you have any questions about the payment process, please contact our support team.</p>
          <div className="help-contacts">
            <a href="mailto:support@b2bmarketplace.com">📧 support@b2bmarketplace.com</a>
            <a href="tel:+911234567890">📞 +91 123 456 7890</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiSupplierPaymentInstructions
