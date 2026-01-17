import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import { QRCodeSVG } from 'qrcode.react'
import './PaymentInstructions.css'

function PaymentInstructions() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [order, setOrder] = useState(location.state?.orderDetails || null)
  const [bankDetails, setBankDetails] = useState(location.state?.bankDetails || null)
  const [loading, setLoading] = useState(!order)
  const [uploading, setUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState(null)
  const [paymentReference, setPaymentReference] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')

  // Bank list with NetBanking URLs
  const bankList = [
    { name: 'State Bank of India (SBI)', url: 'https://www.onlinesbi.sbi/' },
    { name: 'HDFC Bank', url: 'https://netbanking.hdfcbank.com/' },
    { name: 'ICICI Bank', url: 'https://www.icicibank.com/online-banking' },
    { name: 'Axis Bank', url: 'https://www.axisbank.com/bank-smart/internet-banking' },
    { name: 'Kotak Mahindra Bank', url: 'https://www.kotak.com/en/digital-banking/ways-to-bank/net-banking.html' },
    { name: 'Punjab National Bank', url: 'https://netbanking.pnb.co.in/' },
    { name: 'Bank of Baroda', url: 'https://www.barodaconnect.com/' },
    { name: 'Canara Bank', url: 'https://netbanking.canarabank.in/' },
    { name: 'Union Bank of India', url: 'https://www.unionbankofindia.co.in/english/internet-banking.aspx' },
    { name: 'Bank of India', url: 'https://bankofindia.co.in/internet-banking' },
    { name: 'IndusInd Bank', url: 'https://indusnet.indusind.com/' },
    { name: 'Yes Bank', url: 'https://netbanking.yesbank.in/' },
    { name: 'IDBI Bank', url: 'https://www.idbibank.in/internet-banking.asp' },
    { name: 'Federal Bank', url: 'https://www.federalbank.co.in/internet-banking' },
    { name: 'South Indian Bank', url: 'https://www.southindianbank.com/content/personal-banking/digital-banking/internet-banking' },
  ]

  // Handle bank selection and redirect
  const handleBankSelect = (e) => {
    const bankUrl = e.target.value
    setSelectedBank(bankUrl)
    if (bankUrl) {
      window.open(bankUrl, '_blank')
      setMessage({ type: 'info', text: 'Bank website opened in new tab. Complete your transfer there.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  // Detect if user is on mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  // Generate UPI Deep Link URL
  const generateUPILink = useMemo(() => {
    if (!bankDetails?.upiId || !order?.totalAmount) return null
    
    const upiId = bankDetails.upiId
    const payeeName = encodeURIComponent(bankDetails.accountName || 'Supplier')
    const amount = order.totalAmount.toFixed(2)
    const transactionNote = encodeURIComponent(`Order ${orderNumber}`)
    const merchantCode = encodeURIComponent('MarketPlus')
    
    // UPI Deep Link format
    return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&tn=${transactionNote}&mc=${merchantCode}&cu=INR`
  }, [bankDetails, order, orderNumber])

  useEffect(() => {
    if (!order) {
      fetchOrderDetails()
    }
    if (!bankDetails && order?.supplierId) {
      fetchBankDetails(order.supplierId)
    }
  }, [orderNumber, order])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const result = await orderAPI.getByOrderNumber(orderNumber)
      if (result.success && result.data) {
        setOrder(result.data)
        if (result.data.supplierId) {
          await fetchBankDetails(result.data.supplierId)
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to load order details' })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setMessage({ type: 'error', text: 'Failed to load order details' })
    } finally {
      setLoading(false)
    }
  }

  const fetchBankDetails = async (supplierId) => {
    try {
      const result = await orderAPI.getSupplierBankDetails(supplierId)
      if (result.success && result.data) {
        setBankDetails(result.data)
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' })
        return
      }
      setPaymentProof(file)
      setMessage({ type: '', text: '' })
    }
  }

  const handleSubmitProof = async (e) => {
    e.preventDefault()
    
    if (!paymentReference.trim()) {
      setMessage({ type: 'error', text: 'Please enter the payment reference/transaction ID' })
      return
    }
    
    if (!paymentProof) {
      setMessage({ type: 'error', text: 'Please upload payment proof (screenshot or receipt)' })
      return
    }

    try {
      setUploading(true)
      
      // Step 1: Upload the file
      const formData = new FormData()
      formData.append('file', paymentProof)
      
      const uploadResult = await orderAPI.uploadPaymentProof(formData)
      
      if (!uploadResult.success) {
        setMessage({ 
          type: 'error', 
          text: uploadResult.message || 'Failed to upload file. Please try again.' 
        })
        return
      }

      // Step 2: Submit the payment proof with the uploaded file URL
      const paymentProofUrl = `http://localhost:8083${uploadResult.url}`
      
      const result = await orderAPI.submitPaymentProof(orderNumber, {
        paymentReference: paymentReference.trim(),
        paymentProofUrl: paymentProofUrl
      })

      if (result.success) {
        setSubmitted(true)
        setMessage({ 
          type: 'success', 
          text: 'Payment proof submitted successfully! The supplier will verify and process your order.' 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to submit payment proof. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit payment proof. Please try again.' 
      })
    } finally {
      setUploading(false)
    }
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

  // Copy all bank details at once
  const copyAllBankDetails = () => {
    const details = `
Bank Name: ${bankDetails?.bankName || 'N/A'}
Account Name: ${bankDetails?.accountName || 'N/A'}
Account Number: ${bankDetails?.accountNumber || 'N/A'}
IFSC Code: ${bankDetails?.ifscCode || 'N/A'}
Branch: ${bankDetails?.branchName || 'N/A'}

Amount: ₹${order?.totalAmount?.toFixed(2) || '0.00'}
Reference: Order #${orderNumber}
    `.trim()
    
    navigator.clipboard.writeText(details)
    setMessage({ type: 'success', text: 'All bank details copied to clipboard!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // Handle UPI App payment
  const handlePayWithUPI = () => {
    if (!generateUPILink) {
      setMessage({ type: 'error', text: 'UPI payment details not available' })
      return
    }
    
    setPaymentInitiated(true)
    
    // Open UPI intent
    window.location.href = generateUPILink
    
    // Show message after a short delay
    setTimeout(() => {
      setMessage({ 
        type: 'info', 
        text: 'Complete the payment in your UPI app, then come back and submit the transaction ID below.' 
      })
    }, 1000)
  }

  // Open UPI app on desktop (fallback - show QR)
  const handleDesktopUPI = () => {
    setMessage({ 
      type: 'info', 
      text: 'Scan the QR code with your phone\'s UPI app to pay' 
    })
  }

  if (loading) {
    return (
      <div className="payment-instructions-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  // Priority: location.state.paymentType > order.paymentType > default
  const paymentType = location.state?.paymentType || order?.paymentType || 'BANK_TRANSFER'

  return (
    <div className="payment-instructions-page">
      <div className="payment-instructions-container">
        <div className="instructions-header">
          <div className="order-badge">
            Order #{orderNumber}
          </div>
          <h1>
            {paymentType === 'UPI' ? '📱 UPI Payment' : '🏦 Bank Transfer'} Instructions
          </h1>
          <p className="instructions-subtitle">
            Complete your payment to process your order • <strong>0% Payment Fee</strong>
          </p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {submitted ? (
          <div className="submission-success">
            <div className="success-icon">✓</div>
            <h2>Payment Proof Submitted!</h2>
            <p>
              Your payment proof has been sent to the supplier for verification.
              You will receive a notification once verified.
            </p>
            <div className="order-status-card">
              <div className="status-item">
                <span className="status-label">Order Status:</span>
                <span className="status-value awaiting">Awaiting Payment Verification</span>
              </div>
              <div className="status-item">
                <span className="status-label">Reference:</span>
                <span className="status-value">{paymentReference}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/buyer/orders')}
              >
                View My Orders
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="instructions-grid">
              {/* Step 1: Payment Details */}
              <div className="instruction-card step-card">
                <div className="step-number">1</div>
                <h3>Payment Details</h3>
                
                {paymentType === 'UPI' ? (
                  <div className="payment-details upi-details">
                    {/* Pay Now Button - Primary Action */}
                    <div className="pay-now-section">
                      {isMobile ? (
                        <button 
                          className="pay-now-btn"
                          onClick={handlePayWithUPI}
                          disabled={!generateUPILink}
                        >
                          <span className="pay-icon">📲</span>
                          Pay ₹{order?.totalAmount?.toFixed(2)} with UPI App
                        </button>
                      ) : (
                        <button 
                          className="pay-now-btn desktop"
                          onClick={handleDesktopUPI}
                        >
                          <span className="pay-icon">📱</span>
                          Scan QR to Pay ₹{order?.totalAmount?.toFixed(2)}
                        </button>
                      )}
                      <p className="pay-hint">
                        {isMobile 
                          ? 'Opens GPay, PhonePe, Paytm or your default UPI app' 
                          : 'Scan with any UPI app on your phone'}
                      </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="qr-code-section">
                      <div className="qr-code-wrapper">
                        {generateUPILink ? (
                          <QRCodeSVG 
                            value={generateUPILink}
                            size={180}
                            level="H"
                            includeMargin={true}
                            bgColor="#ffffff"
                            fgColor="#1a1a2e"
                          />
                        ) : (
                          <div className="qr-placeholder-box">
                            <span>📱</span>
                            <p>QR Code</p>
                          </div>
                        )}
                      </div>
                      <p className="qr-label">Scan with any UPI App</p>
                    </div>

                    {/* UPI ID Display */}
                    <div className="upi-id-display">
                      <span className="label">Or pay to UPI ID:</span>
                      <div className="upi-value-row">
                        <span className="value">{bankDetails?.upiId || 'supplier@upi'}</span>
                        <button 
                          className={`copy-btn ${copiedField === 'UPI ID' ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(bankDetails?.upiId || 'supplier@upi', 'UPI ID')}
                        >
                          {copiedField === 'UPI ID' ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Amount Display */}
                    <div className="amount-info">
                      <div className="amount-row">
                        <span className="label">Amount:</span>
                        <span className="amount-value">₹{order?.totalAmount?.toFixed(2)}</span>
                        <button 
                          className={`copy-btn small ${copiedField === 'Amount' ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(order?.totalAmount?.toFixed(2), 'Amount')}
                        >
                          {copiedField === 'Amount' ? '✓' : '📋'}
                        </button>
                      </div>
                      <div className="amount-row">
                        <span className="label">Reference:</span>
                        <span className="ref-value">Order #{orderNumber}</span>
                        <button 
                          className={`copy-btn small ${copiedField === 'Reference' ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(`Order ${orderNumber}`, 'Reference')}
                        >
                          {copiedField === 'Reference' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="payment-details bank-details">
                    {/* Copy All Button */}
                    <div className="copy-all-section">
                      <button 
                        className="copy-all-btn"
                        onClick={copyAllBankDetails}
                      >
                        📋 Copy All Bank Details
                      </button>
                    </div>

                    <div className="detail-row">
                      <span className="label">Bank Name:</span>
                      <span className="value">{bankDetails?.bankName || 'Bank'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Account Name:</span>
                      <span className="value">{bankDetails?.accountName || 'Supplier Account'}</span>
                      <button 
                        className={`copy-btn ${copiedField === 'Account Name' ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(bankDetails?.accountName || 'Supplier Account', 'Account Name')}
                      >
                        {copiedField === 'Account Name' ? '✓' : '📋'}
                      </button>
                    </div>
                    <div className="detail-row highlight">
                      <span className="label">Account Number:</span>
                      <span className="value account-number">{bankDetails?.accountNumber || 'XXXX XXXX XXXX'}</span>
                      <button 
                        className={`copy-btn ${copiedField === 'Account Number' ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(bankDetails?.accountNumber || '', 'Account Number')}
                      >
                        {copiedField === 'Account Number' ? '✓' : '📋'}
                      </button>
                    </div>
                    <div className="detail-row highlight">
                      <span className="label">IFSC Code:</span>
                      <span className="value ifsc-code">{bankDetails?.ifscCode || 'XXXX0000XXX'}</span>
                      <button 
                        className={`copy-btn ${copiedField === 'IFSC Code' ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(bankDetails?.ifscCode || '', 'IFSC Code')}
                      >
                        {copiedField === 'IFSC Code' ? '✓' : '📋'}
                      </button>
                    </div>
                    {bankDetails?.branchName && (
                      <div className="detail-row">
                        <span className="label">Branch:</span>
                        <span className="value">{bankDetails.branchName}</span>
                      </div>
                    )}

                    {/* Amount Section */}
                    <div className="bank-amount-section">
                      <div className="amount-box">
                        <span className="label">Transfer Amount:</span>
                        <span className="amount-value">₹{order?.totalAmount?.toFixed(2)}</span>
                        <button 
                          className={`copy-btn ${copiedField === 'Amount' ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(order?.totalAmount?.toFixed(2), 'Amount')}
                        >
                          {copiedField === 'Amount' ? '✓' : '📋'}
                        </button>
                      </div>
                      <div className="reference-box">
                        <span className="label">Use as Reference:</span>
                        <span className="ref-value">{orderNumber}</span>
                        <button 
                          className={`copy-btn ${copiedField === 'Reference' ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(orderNumber, 'Reference')}
                        >
                          {copiedField === 'Reference' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    {/* Quick Transfer Options */}
                    <div className="quick-transfer-options">
                      <label className="options-label" htmlFor="bankSelect">
                        🏦 Quick transfer via NetBanking:
                      </label>
                      <div className="bank-select-wrapper">
                        <select 
                          id="bankSelect"
                          className="bank-select"
                          value={selectedBank}
                          onChange={handleBankSelect}
                        >
                          <option value="">-- Select Your Bank --</option>
                          {bankList.map((bank, index) => (
                            <option key={index} value={bank.url}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                        <span className="select-hint">
                          Select your bank to open NetBanking in a new tab
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Make Payment */}
              <div className="instruction-card step-card">
                <div className="step-number">2</div>
                <h3>Complete Payment</h3>
                <div className="step-instructions">
                  {paymentType === 'UPI' ? (
                    <>
                      {paymentInitiated ? (
                        <div className="payment-status-box">
                          <div className="status-icon">⏳</div>
                          <h4>Payment in Progress</h4>
                          <p>Complete the payment in your UPI app</p>
                          <ol>
                            <li>Approve the payment request in your app</li>
                            <li>Note the 12-digit UPI Transaction ID</li>
                            <li>Come back here and submit the ID below</li>
                          </ol>
                          <button 
                            className="retry-btn"
                            onClick={handlePayWithUPI}
                          >
                            🔄 Retry Payment
                          </button>
                        </div>
                      ) : (
                        <ol>
                          <li><strong>Click "Pay with UPI App"</strong> button above</li>
                          <li>Your UPI app will open with pre-filled details</li>
                          <li>Enter your UPI PIN to complete payment</li>
                          <li>Note the 12-digit Transaction ID</li>
                          <li>Return here and enter the Transaction ID below</li>
                        </ol>
                      )}
                    </>
                  ) : (
                    <ol>
                      <li><strong>Copy all bank details</strong> using the button above</li>
                      <li>Open your bank's NetBanking or mobile app</li>
                      <li>Add beneficiary with the copied details</li>
                      <li>Transfer: <strong>₹{order?.totalAmount?.toFixed(2)}</strong></li>
                      <li>Use reference: <strong>{orderNumber}</strong></li>
                      <li>Note the UTR/Transaction number</li>
                    </ol>
                  )}
                </div>
              </div>

              {/* Step 3: Submit Proof */}
              <div className="instruction-card step-card full-width">
                <div className="step-number">3</div>
                <h3>Submit Payment Proof</h3>
                <form onSubmit={handleSubmitProof} className="proof-form">
                  <div className="form-group">
                    <label htmlFor="paymentReference">
                      {paymentType === 'UPI' ? 'UPI Transaction ID / Reference Number *' : 'Transaction/UTR Number *'}
                    </label>
                    <input
                      type="text"
                      id="paymentReference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder={paymentType === 'UPI' ? 'e.g., 123456789012' : 'e.g., UTR123456789'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentProof">
                      Payment Screenshot / Receipt *
                    </label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="paymentProof"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                      <div className="upload-placeholder">
                        {paymentProof ? (
                          <>
                            <span className="file-icon">📄</span>
                            <span className="file-name">{paymentProof.name}</span>
                            <button 
                              type="button" 
                              className="remove-file"
                              onClick={() => setPaymentProof(null)}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="upload-icon">📤</span>
                            <span>Click to upload or drag & drop</span>
                            <span className="file-hint">PNG, JPG or PDF (max 5MB)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-proof-btn"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-small"></span>
                        Submitting...
                      </>
                    ) : (
                      '✓ Submit Payment Proof'
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="help-section">
              <h4>Need Help?</h4>
              <p>
                If you face any issues with the payment, please contact the supplier directly 
                or reach out to our support team.
              </p>
              <div className="help-actions">
                <button className="btn-outline" onClick={() => navigate('/support')}>
                  Contact Support
                </button>
                <button className="btn-outline" onClick={() => navigate('/buyer/orders')}>
                  View My Orders
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentInstructions
